import { type HttpClient, httpClient } from "@/service";

export interface OrderItem {
	orderItemId: number;
	orderNumber: string;
	prodId: number;
	skuId: number;
	prodCount: number;
	prodName: string;
	skuName: string;
	pic: string;
	price: number;
	productTotalAmount: number;
	commSts: number; // 0:未评价 1:已评价
}

export interface UserAddrOrder {
	addrOrderId: number;
	userId: string;
	receiver: string;
	mobile: string;
	province: string;
	city: string;
	area: string;
	addr: string;
	postCode: string;
}

export interface Order {
	orderId: number;
	shopId: number;
	prodName: string;
	userId: string;
	orderNumber: string;
	total: number;
	actualTotal: number;
	payType: number; // 1:微信 2:支付宝
	remarks: string;
	status: number; // -1:已取消 0:待付款 1:待发货 2:待收货 3:已完成
	dvyType: string;
	dvyId: number;
	dvyFlowId: string;
	freightAmount: number;
	addrOrderId: number;
	productNums: number;
	createTime: string;
	updateTime: string;
	payTime: string;
	dvyTime: string;
	finallyTime: string;
	cancelTime: string;
	isPayed: number; // 0:未支付 1:已支付
	deleteStatus: number;
	refundSts: number; // 0:默认 1:处理中 2:处理完成
	reduceAmount: number;
	shopName?: string;
	orderItems?: OrderItem[];
	userAddrOrder?: UserAddrOrder;
}

export interface FetchOrderPageRequest {
	current: number;
	size: number;
	orderNumber?: string;
	status?: number;
	isPayed?: number;
	startTime?: string;
	endTime?: string;
}

export interface FetchOrderPageResponse {
	current: number;
	pages: number;
	records: Order[];
	size: number;
	total: number;
}

export interface DeliveryOrderRequest {
	orderNumber: string;
	dvyId: number;
	dvyFlowId: string;
}

const ORDER_BASE_PATH = "/order/order";

export function createOrderApi(client: HttpClient = httpClient) {
	return {
		// 分页获取订单列表
		fetchPage(params: FetchOrderPageRequest): Promise<FetchOrderPageResponse> {
			const urlParams = Object.entries(params)
				.map(([key, value]) => {
					if (value === undefined || value === null || value === "") {
						return "";
					}
					return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
				})
				.filter(Boolean)
				.join("&");

			const url = urlParams
				? `${ORDER_BASE_PATH}/page?${urlParams}`
				: `${ORDER_BASE_PATH}/page`;
			return client.get<FetchOrderPageResponse, FetchOrderPageResponse>(url);
		},
		// 获取订单详情
		getByOrderNumber(orderNumber: string): Promise<Order> {
			return client.get<Order, Order>(
				`${ORDER_BASE_PATH}/orderInfo/${orderNumber}`,
			);
		},
		// 发货
		delivery(data: DeliveryOrderRequest): Promise<void> {
			return client.put(`${ORDER_BASE_PATH}/delivery`, data);
		},
	};
}

export const orderApi = createOrderApi();

// 订单状态映射
export const ORDER_STATUS_MAP: Record<
	number,
	{ text: string; color: string }
> = {
	"-1": { text: "已取消", color: "default" },
	0: { text: "待付款", color: "warning" },
	1: { text: "待发货", color: "processing" },
	2: { text: "待收货", color: "cyan" },
	3: { text: "已完成", color: "success" },
};

// 支付方式映射
export const PAY_TYPE_MAP: Record<number, string> = {
	1: "微信支付",
	2: "支付宝",
};
