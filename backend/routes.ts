import express, { Request, Response } from 'express';
import { store } from './store';

export const apiRouter = express.Router();

// GET /api/restaurants
apiRouter.get('/restaurants', (req: Request, res: Response) => {
  try {
    const { search, category, isVegOnly, minRating, maxDeliveryTime, sortBy } = req.query;

    const restaurants = store.getRestaurants({
      search: search as string,
      category: category as string,
      isVegOnly: isVegOnly === 'true',
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      maxDeliveryTime: maxDeliveryTime ? parseInt(maxDeliveryTime as string, 10) : undefined,
      sortBy: sortBy as string,
    });

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch restaurants' });
  }
});

// GET /api/restaurants/:id
apiRouter.get('/restaurants/:id', (req: Request, res: Response) => {
  try {
    const details = store.getRestaurantById(req.params.id);
    if (!details) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, data: details });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/categories
apiRouter.get('/categories', (_req: Request, res: Response) => {
  try {
    const categories = store.getCategories();
    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/promos
apiRouter.get('/promos', (_req: Request, res: Response) => {
  try {
    const promos = store.getPromoCodes();
    res.json({ success: true, data: promos });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/promos/validate
apiRouter.post('/promos/validate', (req: Request, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code || typeof subtotal !== 'number') {
      return res.status(400).json({ success: false, message: 'Promo code and subtotal are required' });
    }

    const result = store.validatePromo(code, subtotal);
    res.json({ success: result.valid, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/addresses
apiRouter.get('/addresses', (_req: Request, res: Response) => {
  try {
    const addresses = store.getAddresses();
    res.json({ success: true, data: addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/addresses
apiRouter.post('/addresses', (req: Request, res: Response) => {
  try {
    const newAddress = store.addAddress(req.body);
    res.status(201).json({ success: true, data: newAddress });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/orders
apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const { restaurantId, items, deliveryAddress, paymentMethod, promoCode, tip, deliveryInstructions } = req.body;

    if (!restaurantId || !items || !Array.isArray(items) || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order fields (restaurantId, items, deliveryAddress)',
      });
    }

    const order = store.createOrder({
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod: paymentMethod || 'card',
      promoCode,
      tip,
      deliveryInstructions,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/orders
apiRouter.get('/orders', (_req: Request, res: Response) => {
  try {
    const orders = store.getOrders();
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id
apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  try {
    const order = store.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/orders/:id/cancel
apiRouter.patch('/orders/:id/cancel', (req: Request, res: Response) => {
  try {
    const result = store.cancelOrder(req.params.id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});
