import axios from 'axios';

// Default to local for development, use environment variable for production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/react_viet/backend/api';
console.log("%c TORVO TOOLS LIVE VERSION 1.1 ", "background: #8026D9; color: white; font-weight: bold; padding: 4px;");

export const IMAGE_BASE_URL = API_URL.endsWith('/api') 
    ? API_URL.substring(0, API_URL.length - 3) 
    : API_URL + '/';



const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('application/json')) {
            return response;
        }
        return Promise.reject(new Error('Invalid response type'));
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('jwt');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Product services
export const getProducts = (params = {}) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => {
    if (data instanceof FormData) {
        return api.post('/products', data, {
            headers: { 'Content-Type': undefined },
        });
    }
    return api.post('/products', data);
};

export const updateProduct = (id, data) => {
    if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return api.post(`/products/${id}`, data, {
            headers: { 'Content-Type': undefined },
        });
    }
    return api.put(`/products/${id}`, data);
};
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Category services
export const getCategories = () => api.get('/categories');
export const getCategory = (id) => api.get(`/categories/${id}`);
export const createCategory = (data) => {
    if (data instanceof FormData) {
        return api.post('/categories', data, {
            headers: { 'Content-Type': undefined },
        });
    }
    return api.post('/categories', data);
};
export const updateCategory = (id, data) => {
    if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return api.post(`/categories/${id}`, data, {
            headers: { 'Content-Type': undefined },
        });
    }
    return api.put(`/categories/${id}`, data);
};
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Auth services
export const login = (data) => api.post('/login', data);
export const register = (data) => api.post('/register', data);

// Order services
export const createOrder = (data) => api.post('/orders', data);
export const getOrders = () => api.get('/orders');
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const trackOrder = (orderId, email) => api.get(`/track-order?order_id=${orderId}&email=${email}`);

// User services
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Dealer services
export const getDealers = () => api.get('/dealers');
export const createDealer = (data) => api.post('/dealers', data);
export const updateDealer = (id, data) => api.put(`/dealers/${id}`, data);
export const deleteDealer = (id) => api.delete(`/dealers/${id}`);

// RFQ and Quote services
export const getRfqs = () => api.get('/rfqs');
export const createRfq = (data) => api.post('/rfqs', data);
export const createQuote = (data) => api.post('/quotes', data);
export const updateQuote = (id, data) => api.put(`/quotes/${id}`, data);

// Banner services
export const getBanners = () => api.get('/banners');
export const createBanner = (data) => api.post('/banners', data);
export const updateBanner = (id, data) => api.put(`/banners/${id}`, data);
export const deleteBanner = (id) => api.delete(`/banners/${id}`);
export const updateBannerOrder = (data) => api.post('/banners/order', data);

// Brand services
export const getBrands = () => api.get('/brands');
export const createBrand = (data) => {
    if (data instanceof FormData) {
        return api.post('/brands', data, {
            headers: { 'Content-Type': undefined },
        });
    }
    return api.post('/brands', data);
};
export const updateBrand = (id, data) => {
    if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return api.post(`/brands/${id}`, data, {
            headers: { 'Content-Type': undefined },
        });
    }
    return api.put(`/brands/${id}`, data);
};
export const deleteBrand = (id) => api.delete(`/brands/${id}`);

// Wishlist services
export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (productId) => api.post('/wishlist', { product_id: productId });
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`);


// Review services
export const getReviews = (productId) => api.get(`/reviews/${productId}`);
export const submitReview = (data) => api.post('/reviews', data);

// Profile services
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

// Payment services
export const createPaymentIntent = (data) => api.post('/payment', data);

// Coupon services
export const verifyCoupon = (code) => api.get(`/coupons/${code}`);

// Page services
export const getPages = () => api.get('/pages');
export const getPage = (id) => api.get(`/pages/${id}`);
export const createPage = (data) => api.post('/pages', data);
export const updatePage = (id, data) => api.put(`/pages/${id}`, data);
export const deletePage = (id) => api.delete(`/pages/${id}`);

// Post services
export const getPosts = () => api.get('/posts');
export const getPost = (id) => api.get(`/posts/${id}`);
export const createPost = (data) => {
    if (data instanceof FormData) {
        return api.post('/posts', data, {
            headers: { 'Content-Type': undefined },
        });
    }
    return api.post('/posts', data);
};
export const updatePost = (id, data) => {
    if (data instanceof FormData) {
        data.append('_method', 'PUT');
        return api.post(`/posts/${id}`, data, {
            headers: { 'Content-Type': undefined },
        });
    }
    return api.put(`/posts/${id}`, data);
};
export const deletePost = (id) => api.delete(`/posts/${id}`);

// Feature services
export const getFeatures = () => api.get('/features');
export const createFeature = (data) => api.post('/features', data);
export const updateFeature = (id, data) => api.put(`/features/${id}`, data);
export const deleteFeature = (id) => api.delete(`/features/${id}`);
export const updateFeatureOrder = (data) => api.post('/features/order', data);

// Menu services
export const getMenus = () => api.get('/menus');
export const createMenu = (data) => api.post('/menus', data);
export const updateMenu = (id, data) => api.put(`/menus/${id}`, data);
export const deleteMenu = (id) => api.delete(`/menus/${id}`);
export const updateMenuOrder = (data) => api.post('/menus/order', data);

// Settings services
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => {
    if (data instanceof FormData) {
        return api.post('/settings', data, {
            headers: { 'Content-Type': undefined },
        });
    }
    return api.post('/settings', data);
};

// Analytics services
export const getAnalytics = () => api.get('/analytics');
export const getActivities = () => api.get('/activities');

// Report services
export const getReportUrl = (type) => `${API_URL}/reports?type=${type}&token=${localStorage.getItem('jwt')}`;

// Fleet services
export const getFleet = () => api.get('/fleet');
export const addToFleet = (data) => api.post('/fleet', data);
export const updateFleet = (id, data) => api.put(`/fleet/${id}`, data);

// Invoice services
export const getInvoices = (id = null) => id ? api.get(`/invoices/${id}`) : api.get('/invoices');
export const payInvoice = (id) => api.patch(`/invoices/${id}`, { status: 'paid' });

// Notification services
export const getNotifications = () => api.get('/notifications');
export const markAsRead = (id) => api.put(`/notifications/${id}`);

// Analytics services
export const getProcurementDashboard = (id = null) => id ? api.get(`/procurement_dashboard/${id}`) : api.get('/procurement_dashboard');

// Shipping services
export const getShipping = (id = null) => id ? api.get(`/shipping/${id}`) : api.get('/shipping');
export const updateShipment = (id, data) => api.put(`/shipping/${id}`, data);

// Project services
export const getProjects = (id = null) => id ? api.get(`/projects/${id}`) : api.get('/projects');
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);

// Intelligence services
export const getInventoryPrediction = () => api.get('/inventory_prediction');

// Credit services
export const getCredit = (id = null) => id ? api.get(`/credit/${id}`) : api.get('/credit');
export const updateCredit = (data) => api.post('/credit', data);


export default api;
