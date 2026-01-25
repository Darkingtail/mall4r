import {
	ORDER_STATUS_MAP,
	type Order,
	type OrderItem,
	PAY_TYPE_MAP,
	orderApi,
} from "@/service/api/order";
import {
	Descriptions,
	Image,
	Modal,
	Spin,
	Table,
	Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";

interface OrderDetailModalProps {
	open: boolean;
	orderNumber: string | null;
	onClose: () => void;
}

export default function OrderDetailModal({
	open,
	orderNumber,
	onClose,
}: OrderDetailModalProps) {
	const [loading, setLoading] = useState(false);
	const [order, setOrder] = useState<Order | null>(null);

	useEffect(() => {
		if (open && orderNumber) {
			setLoading(true);
			orderApi
				.getByOrderNumber(orderNumber)
				.then((data) => {
					setOrder(data);
				})
				.catch(console.error)
				.finally(() => setLoading(false));
		}
	}, [open, orderNumber]);

	const statusItem = order ? ORDER_STATUS_MAP[order.status] : null;

	const itemColumns: ColumnsType<OrderItem> = [
		{
			title: "商品图片",
			dataIndex: "pic",
			key: "pic",
			width: 80,
			render: (pic) =>
				pic ? (
					<Image src={pic} width={50} height={50} style={{ objectFit: "cover" }} />
				) : (
					"-"
				),
		},
		{
			title: "商品名称",
			dataIndex: "prodName",
			key: "prodName",
			ellipsis: true,
		},
		{
			title: "规格",
			dataIndex: "skuName",
			key: "skuName",
			width: 120,
		},
		{
			title: "单价",
			dataIndex: "price",
			key: "price",
			width: 100,
			align: "right",
			render: (val) => `¥${val?.toFixed(2) ?? "0.00"}`,
		},
		{
			title: "数量",
			dataIndex: "prodCount",
			key: "prodCount",
			width: 80,
			align: "center",
		},
		{
			title: "小计",
			dataIndex: "productTotalAmount",
			key: "productTotalAmount",
			width: 100,
			align: "right",
			render: (val) => `¥${val?.toFixed(2) ?? "0.00"}`,
		},
	];

	const getFullAddress = () => {
		if (!order?.userAddrOrder) return "-";
		const addr = order.userAddrOrder;
		return `${addr.province}${addr.city}${addr.area}${addr.addr}`;
	};

	return (
		<Modal
			title="订单详情"
			open={open}
			onCancel={onClose}
			footer={null}
			width={800}
			destroyOnHidden
		>
			<Spin spinning={loading}>
				{order && (
					<div className="space-y-4">
						{/* 订单基本信息 */}
						<Descriptions
							title="订单信息"
							bordered
							size="small"
							column={2}
						>
							<Descriptions.Item label="订单号">
								{order.orderNumber}
							</Descriptions.Item>
							<Descriptions.Item label="订单状态">
								{statusItem ? (
									<Tag color={statusItem.color}>{statusItem.text}</Tag>
								) : (
									"-"
								)}
							</Descriptions.Item>
							<Descriptions.Item label="订单金额">
								¥{order.total?.toFixed(2) ?? "0.00"}
							</Descriptions.Item>
							<Descriptions.Item label="实付金额">
								¥{order.actualTotal?.toFixed(2) ?? "0.00"}
							</Descriptions.Item>
							<Descriptions.Item label="运费">
								¥{order.freightAmount?.toFixed(2) ?? "0.00"}
							</Descriptions.Item>
							<Descriptions.Item label="优惠金额">
								¥{order.reduceAmount?.toFixed(2) ?? "0.00"}
							</Descriptions.Item>
							<Descriptions.Item label="支付方式">
								{order.payType ? PAY_TYPE_MAP[order.payType] || "-" : "-"}
							</Descriptions.Item>
							<Descriptions.Item label="商品数量">
								{order.productNums}
							</Descriptions.Item>
							<Descriptions.Item label="下单时间" span={2}>
								{order.createTime}
							</Descriptions.Item>
							{order.payTime && (
								<Descriptions.Item label="支付时间" span={2}>
									{order.payTime}
								</Descriptions.Item>
							)}
							{order.dvyTime && (
								<Descriptions.Item label="发货时间" span={2}>
									{order.dvyTime}
								</Descriptions.Item>
							)}
							{order.dvyFlowId && (
								<Descriptions.Item label="物流单号" span={2}>
									{order.dvyFlowId}
								</Descriptions.Item>
							)}
							{order.remarks && (
								<Descriptions.Item label="订单备注" span={2}>
									{order.remarks}
								</Descriptions.Item>
							)}
						</Descriptions>

						{/* 收货信息 */}
						{order.userAddrOrder && (
							<Descriptions
								title="收货信息"
								bordered
								size="small"
								column={2}
							>
								<Descriptions.Item label="收货人">
									{order.userAddrOrder.receiver}
								</Descriptions.Item>
								<Descriptions.Item label="联系电话">
									{order.userAddrOrder.mobile}
								</Descriptions.Item>
								<Descriptions.Item label="收货地址" span={2}>
									{getFullAddress()}
								</Descriptions.Item>
							</Descriptions>
						)}

						{/* 商品列表 */}
						<div>
							<h4 className="mb-2 font-medium">商品信息</h4>
							<Table
								rowKey="orderItemId"
								columns={itemColumns}
								dataSource={order.orderItems || []}
								pagination={false}
								size="small"
							/>
						</div>
					</div>
				)}
			</Spin>
		</Modal>
	);
}
