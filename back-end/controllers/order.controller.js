import mongoose from "mongoose";
import Order from "../models/order.model.js";
import { ApiError } from "../middleware/errors.js";

const toOrderResponse = (order) => ({
  id: order._id,
  products: order.products.map((item) => ({
    productId: item.product,
    name: item.productName,
    quantity: item.quantity,
    unitAmountMinorUnits: item.unitAmountMinorUnits,
    lineTotalMinorUnits: Number.isSafeInteger(
      item.unitAmountMinorUnits * item.quantity,
    )
      ? item.unitAmountMinorUnits * item.quantity
      : null,
  })),
  totalAmountMinorUnits: Number.isSafeInteger(order.totalAmountMinorUnits)
    ? order.totalAmountMinorUnits
    : null,
  currency: order.currency,
  status: order.status,
  createdAt: order.createdAt,
});

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1, _id: -1 })
      .select(
        "_id products.product products.productName products.quantity products.unitAmountMinorUnits totalAmountMinorUnits currency status createdAt",
      )
      .lean();

    return res.status(200).json({ orders: orders.map(toOrderResponse) });
  } catch (error) {
    return next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.isObjectIdOrHexString(orderId)) {
      return next(new ApiError(400, "INVALID_ORDER_ID", "Order ID is invalid."));
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    })
      .select(
        "_id products.product products.productName products.quantity products.unitAmountMinorUnits totalAmountMinorUnits currency status createdAt",
      )
      .lean();

    if (!order) {
      return next(new ApiError(404, "ORDER_NOT_FOUND", "Order not found."));
    }

    return res.status(200).json({ order: toOrderResponse(order) });
  } catch (error) {
    return next(error);
  }
};

export { getOrderById, getOrders };
