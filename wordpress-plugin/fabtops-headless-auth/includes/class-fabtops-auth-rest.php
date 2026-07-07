<?php

defined('ABSPATH') || exit;

final class FabTops_Auth_REST {
    private const NS = 'fabtops/v1';

    public function __construct(
        private FabTops_Auth_Sessions $sessions,
        private FabTops_Auth_Security $security,
    ) {}

    public function register_hooks(): void {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes(): void {
        $signed = array($this->security, 'require_signed_request');
        $customer = array($this->security, 'require_customer');

        register_rest_route(self::NS, '/auth/login', array('methods' => 'POST', 'callback' => array($this, 'login'), 'permission_callback' => $signed));
        register_rest_route(self::NS, '/auth/register', array('methods' => 'POST', 'callback' => array($this, 'register'), 'permission_callback' => $signed));
        register_rest_route(self::NS, '/auth/refresh', array('methods' => 'POST', 'callback' => array($this, 'refresh'), 'permission_callback' => $signed));
        register_rest_route(self::NS, '/auth/logout', array('methods' => 'POST', 'callback' => array($this, 'logout'), 'permission_callback' => $signed));
        register_rest_route(self::NS, '/auth/forgot-password', array('methods' => 'POST', 'callback' => array($this, 'forgot_password'), 'permission_callback' => $signed));
        register_rest_route(self::NS, '/auth/reset-password', array('methods' => 'POST', 'callback' => array($this, 'reset_password'), 'permission_callback' => $signed));
        register_rest_route(self::NS, '/me', array(
            array('methods' => 'GET', 'callback' => array($this, 'get_me'), 'permission_callback' => $customer),
            array('methods' => 'PATCH', 'callback' => array($this, 'update_me'), 'permission_callback' => $customer),
        ));
        register_rest_route(self::NS, '/me/addresses', array(
            array('methods' => 'GET', 'callback' => array($this, 'get_addresses'), 'permission_callback' => $customer),
            array('methods' => 'PUT', 'callback' => array($this, 'update_addresses'), 'permission_callback' => $customer),
        ));
        register_rest_route(self::NS, '/me/orders', array('methods' => 'GET', 'callback' => array($this, 'get_orders'), 'permission_callback' => $customer));
        register_rest_route(self::NS, '/me/orders/(?P<id>\d+)', array('methods' => 'GET', 'callback' => array($this, 'get_order'), 'permission_callback' => $customer));
        register_rest_route(self::NS, '/me/wishlist', array(
            array('methods' => 'GET', 'callback' => array($this, 'get_wishlist'), 'permission_callback' => $customer),
            array('methods' => 'PUT', 'callback' => array($this, 'update_wishlist'), 'permission_callback' => $customer),
        ));
    }

    private function success($data, string $message = 'Request completed'): WP_REST_Response {
        return new WP_REST_Response(array('success' => true, 'data' => $data, 'message' => $message), 200);
    }

    private function error(string $code, int $status): WP_Error {
        $messages = array(
            'INVALID_CREDENTIALS' => 'Email or password is incorrect',
            'ACCOUNT_EXISTS' => 'An account with these details already exists',
            'SESSION_EXPIRED' => 'Session expired',
            'ORDER_NOT_FOUND' => 'Order not found',
            'INVALID_REQUEST' => 'Invalid request',
        );
        return new WP_Error($code, $messages[$code] ?? 'Request failed', array('status' => $status));
    }

    private function identity(WP_User $user): array {
        $first = (string) get_user_meta($user->ID, 'first_name', true);
        $last = (string) get_user_meta($user->ID, 'last_name', true);
        return array(
            'id' => (string) $user->ID,
            'name' => trim($first . ' ' . $last) ?: $user->display_name,
            'email' => $user->user_email,
        );
    }

    public function login(WP_REST_Request $request) {
        $email = sanitize_email((string) $request->get_param('email'));
        $password = (string) $request->get_param('password');
        $limited = $this->security->rate_limit('login', $email);
        if (is_wp_error($limited)) return $limited;
        if (!is_email($email) || $password === '') return $this->error('INVALID_CREDENTIALS', 401);

        $account = get_user_by('email', $email);
        if (!$account) return $this->error('INVALID_CREDENTIALS', 401);
        $user = wp_authenticate($account->user_login, $password);
        if (is_wp_error($user) || !in_array('customer', (array) $user->roles, true)) {
            return $this->error('INVALID_CREDENTIALS', 401);
        }

        try {
            return $this->success(array_merge($this->sessions->create((int) $user->ID), array('user' => $this->identity($user))), 'Signed in');
        } catch (Throwable $error) {
            return new WP_Error('AUTH_SERVICE_UNAVAILABLE', 'Authentication unavailable', array('status' => 503));
        }
    }

    public function register(WP_REST_Request $request) {
        $email = sanitize_email((string) $request->get_param('email'));
        $limited = $this->security->rate_limit('register', $email, 5, HOUR_IN_SECONDS);
        if (is_wp_error($limited)) return $limited;
        $first = sanitize_text_field((string) $request->get_param('firstName'));
        $last = sanitize_text_field((string) $request->get_param('lastName'));
        $password = (string) $request->get_param('password');
        if (!is_email($email) || !$first || !$last || strlen($password) < 8) return $this->error('INVALID_REQUEST', 400);
        if (email_exists($email)) return $this->error('ACCOUNT_EXISTS', 409);

        $customer_id = wc_create_new_customer($email, '', $password, array(
            'first_name' => $first,
            'last_name' => $last,
            'display_name' => trim($first . ' ' . $last),
            'role' => 'customer',
        ));
        if (is_wp_error($customer_id)) return $this->error('INVALID_REQUEST', 400);
        $user = get_user_by('id', $customer_id);
        if (!$user instanceof WP_User) return $this->error('INVALID_REQUEST', 400);

        try {
            return $this->success(array_merge($this->sessions->create((int) $user->ID), array('user' => $this->identity($user))), 'Account created');
        } catch (Throwable $error) {
            return new WP_Error('AUTH_SERVICE_UNAVAILABLE', 'Authentication unavailable', array('status' => 503));
        }
    }

    public function refresh(WP_REST_Request $request) {
        $tokens = $this->sessions->rotate((string) $request->get_param('refresh_token'));
        return $tokens ? $this->success($tokens, 'Session refreshed') : $this->error('SESSION_EXPIRED', 401);
    }

    public function logout(WP_REST_Request $request): WP_REST_Response {
        $this->sessions->revoke_token((string) $request->get_param('refresh_token'));
        return $this->success(null, 'Signed out');
    }

    public function forgot_password(WP_REST_Request $request): WP_REST_Response {
        $email = sanitize_email((string) $request->get_param('email'));
        $limited = $this->security->rate_limit('forgot', $email, 5, HOUR_IN_SECONDS);
        if (!is_wp_error($limited) && is_email($email)) {
            $user = get_user_by('email', $email);
            if ($user) {
                $key = get_password_reset_key($user);
                if (!is_wp_error($key) && defined('FABTOPS_STOREFRONT_URL')) {
                    $url = add_query_arg(array('key' => rawurlencode($key), 'login' => rawurlencode($user->user_login)), trailingslashit(FABTOPS_STOREFRONT_URL) . 'reset-password');
                    wp_mail($email, 'Reset your FabTops password', "Use this secure link to reset your password:\n\n" . esc_url_raw($url));
                }
            }
        }
        return $this->success(null, 'If an account exists, a reset link has been sent');
    }

    public function reset_password(WP_REST_Request $request) {
        $login = sanitize_user((string) $request->get_param('login'));
        $limited = $this->security->rate_limit('reset', $login, 5, HOUR_IN_SECONDS);
        if (is_wp_error($limited)) return $limited;
        $password = (string) $request->get_param('password');
        $user = check_password_reset_key((string) $request->get_param('key'), $login);
        if (is_wp_error($user) || strlen($password) < 8) return $this->error('INVALID_REQUEST', 400);
        reset_password($user, $password);
        $this->sessions->revoke_user((int) $user->ID);
        return $this->success(null, 'Password reset');
    }

    private function customer(): WC_Customer {
        return new WC_Customer(get_current_user_id());
    }

    private function customer_dto(WC_Customer $customer): array {
        return array(
            'id' => (string) $customer->get_id(),
            'firstName' => $customer->get_first_name(),
            'lastName' => $customer->get_last_name(),
            'email' => $customer->get_email(),
            'phone' => $customer->get_billing_phone(),
        );
    }

    public function get_me(): WP_REST_Response {
        return $this->success($this->customer_dto($this->customer()));
    }

    public function update_me(WP_REST_Request $request): WP_REST_Response {
        $customer = $this->customer();
        if ($request->has_param('firstName')) $customer->set_first_name(sanitize_text_field((string) $request->get_param('firstName')));
        if ($request->has_param('lastName')) $customer->set_last_name(sanitize_text_field((string) $request->get_param('lastName')));
        if ($request->has_param('phone')) $customer->set_billing_phone(sanitize_text_field((string) $request->get_param('phone')));
        $customer->save();
        return $this->success($this->customer_dto($customer), 'Profile updated');
    }

    private function address_dto(WC_Customer $customer, string $kind): array {
        $get = static fn(string $field) => $customer->{"get_{$kind}_{$field}"}();
        $address = array(
            'firstName' => $get('first_name'), 'lastName' => $get('last_name'), 'company' => $get('company'),
            'address1' => $get('address_1'), 'address2' => $get('address_2'), 'city' => $get('city'),
            'state' => $get('state'), 'postcode' => $get('postcode'), 'country' => $get('country'),
        );
        if ($kind === 'billing') {
            $address['email'] = $get('email');
            $address['phone'] = $get('phone');
        }
        return $address;
    }

    public function get_addresses(): WP_REST_Response {
        $customer = $this->customer();
        return $this->success(array('billing' => $this->address_dto($customer, 'billing'), 'shipping' => $this->address_dto($customer, 'shipping')));
    }

    public function update_addresses(WP_REST_Request $request): WP_REST_Response {
        $customer = $this->customer();
        foreach (array('billing', 'shipping') as $kind) {
            $address = $request->get_param($kind);
            if (!is_array($address)) continue;
            $map = array('firstName' => 'first_name', 'lastName' => 'last_name', 'company' => 'company', 'address1' => 'address_1', 'address2' => 'address_2', 'city' => 'city', 'state' => 'state', 'postcode' => 'postcode', 'country' => 'country');
            if ($kind === 'billing') $map += array('email' => 'email', 'phone' => 'phone');
            foreach ($map as $input => $field) {
                if (array_key_exists($input, $address)) $customer->{"set_{$kind}_{$field}"}(sanitize_text_field((string) $address[$input]));
            }
        }
        $customer->save();
        return $this->get_addresses();
    }

    private function order_dto(WC_Order $order): array {
        $items = array();
        foreach ($order->get_items() as $item) {
            $product = $item->get_product();
            $image_id = $product ? $product->get_image_id() : 0;
            $items[] = array('id' => (string) $item->get_id(), 'name' => $item->get_name(), 'quantity' => $item->get_quantity(), 'total' => $item->get_total(), 'image' => $image_id ? wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail') : null);
        }
        return array(
            'id' => (string) $order->get_id(), 'number' => $order->get_order_number(), 'status' => $order->get_status(),
            'dateCreated' => $order->get_date_created() ? $order->get_date_created()->date(DATE_ATOM) : null,
            'total' => array('amount' => $order->get_total(), 'currencyCode' => $order->get_currency()),
            'lineItems' => $items,
            'trackingUrl' => (string) $order->get_meta('_tracking_link'),
        );
    }

    public function get_orders(): WP_REST_Response {
        $orders = wc_get_orders(array('customer_id' => get_current_user_id(), 'limit' => 50, 'orderby' => 'date', 'order' => 'DESC'));
        return $this->success(array_map(array($this, 'order_dto'), $orders));
    }

    public function get_order(WP_REST_Request $request) {
        $order = wc_get_order((int) $request['id']);
        if (!$order || (int) $order->get_customer_id() !== get_current_user_id()) return $this->error('ORDER_NOT_FOUND', 404);
        return $this->success($this->order_dto($order));
    }

    public function get_wishlist(): WP_REST_Response {
        $user_id = get_current_user_id();
        $wishlist = get_user_meta($user_id, 'fabtops_wishlist', true);
        if (!is_array($wishlist)) {
            $wishlist = array();
        }
        return $this->success($wishlist);
    }

    public function update_wishlist(WP_REST_Request $request): WP_REST_Response {
        $user_id = get_current_user_id();
        $wishlist = $request->get_param('wishlist');
        if (!is_array($wishlist)) {
            return $this->error('INVALID_REQUEST', 400);
        }
        $sanitized = array();
        foreach ($wishlist as $item) {
            if (!is_array($item) || !isset($item['id'])) continue;
            $sanitized[] = array(
                'id' => sanitize_text_field((string)$item['id']),
                'variantId' => sanitize_text_field((string)($item['variantId'] ?? '')),
                'title' => sanitize_text_field((string)($item['title'] ?? '')),
                'handle' => sanitize_text_field((string)($item['handle'] ?? '')),
                'price' => sanitize_text_field((string)($item['price'] ?? '')),
                'currencyCode' => sanitize_text_field((string)($item['currencyCode'] ?? '')),
                'imageUrl' => esc_url_raw((string)($item['imageUrl'] ?? '')),
                'imageAlt' => sanitize_text_field((string)($item['imageAlt'] ?? '')),
            );
        }
        update_user_meta($user_id, 'fabtops_wishlist', $sanitized);
        return $this->success($sanitized, 'Wishlist updated');
    }
}
