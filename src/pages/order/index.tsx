import {
	ORDER_STATUS_MAP,
	type Order,
	orderApi,
} from "@/service/api/order";
import {
	Button,
	DatePicker,
	Form,
	Input,
	Select,
	Space,
	Table,
	Tag,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useState } from "react";
import DeliveryModal from "./DeliveryModal";
import OrderDetailModal from "./OrderDetailModal";

const { RangePicker } = DatePicker;

const statusOptions = [
	{ label: "全部", value: "" },
	{ label: "待付款", value: 0 },
	{ label: "待发货", value: 1 },
	{ label: "待收货", value: 2 },
	{ label: "已完成", value: 3 },
	{ label: "已取消", value: -1 },
];

export default function OrderPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<Order[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();

	// Modal states
	const [detailModalVisible, setDetailModalVisible] = useState(false);
	const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
	const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(
		null,
	);

	const fetchDataSource = useCallback(
		async (
			page = 1,
			size = 10,
			orderNumber?: string,
			status?: number | "",
			dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null,
		) => {
			setLoading(true);
			try {
				const params: {
					current: number;
					size: number;
					orderNumber?: string;
					status?: number;
					startTime?: string;
					endTime?: string;
				} = {
					current: page,
					size,
				};

				if (orderNumber) {
					params.orderNumber = orderNumber;
				}
				if (status !== "" && status !== undefined) {
					params.status = status;
				}
				if (dateRange?.[0] && dateRange?.[1]) {
					params.startTime = dateRange[0].format("YYYY-MM-DD HH:mm:ss");
					params.endTime = dateRange[1].format("YYYY-MM-DD HH:mm:ss");
				}

				const res = await orderApi.fetchPage(params);
				setDataSource(res.records);
				setPagination((prev) => ({
					...prev,
					current: res.current,
					pageSize: res.size,
					total: res.total,
				}));
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		fetchDataSource();
	}, [fetchDataSource]);

	const handleSearch = (values: {
		orderNumber?: string;
		status?: number | "";
		dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
	}) => {
		fetchDataSource(
			1,
			pagination.pageSize,
			values.orderNumber,
			values.status,
			values.dateRange,
		);
	};

	const handleReset = () => {
		searchForm.resetFields();
		fetchDataSource(1, pagination.pageSize);
	};

	const handleTableChange = (newPagination: TablePaginationConfig) => {
		const values = searchForm.getFieldsValue();
		fetchDataSource(
			newPagination.current,
			newPagination.pageSize,
			values.orderNumber,
			values.status,
			values.dateRange,
		);
	};

	const openDetailModal = (orderNumber: string) => {
		setCurrentOrderNumber(orderNumber);
		setDetailModalVisible(true);
	};

	const openDeliveryModal = (orderNumber: string) => {
		setCurrentOrderNumber(orderNumber);
		setDeliveryModalVisible(true);
	};

	const columns: ColumnsType<Order> = [
		{
			title: "订单号",
			dataIndex: "orderNumber",
			key: "orderNumber",
			width: 180,
		},
		{
			title: "商品名称",
			dataIndex: "prodName",
			key: "prodName",
			width: 200,
			ellipsis: true,
		},
		{
			title: "订单金额",
			dataIndex: "actualTotal",
			key: "actualTotal",
			width: 100,
			align: "right",
			render: (val) => `¥${val?.toFixed(2) ?? "0.00"}`,
		},
		{
			title: "商品数量",
			dataIndex: "productNums",
			key: "productNums",
			width: 80,
			align: "center",
		},
		{
			title: "订单状态",
			dataIndex: "status",
			key: "status",
			width: 100,
			align: "center",
			render: (status) => {
				const item = ORDER_STATUS_MAP[status];
				return item ? <Tag color={item.color}>{item.text}</Tag> : "-";
			},
		},
		{
			title: "下单时间",
			dataIndex: "createTime",
			key: "createTime",
			width: 160,
		},
		{
			title: "操作",
			key: "action",
			width: 150,
			align: "center",
			fixed: "right",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						size="small"
						onClick={() => openDetailModal(record.orderNumber)}
					>
						详情
					</Button>
					{record.status === 1 && (
						<Button
							type="link"
							size="small"
							onClick={() => openDeliveryModal(record.orderNumber)}
						>
							发货
						</Button>
					)}
				</Space>
			),
		},
	];

	return (
		<div className="rounded-lg bg-white p-4 shadow-sm">
			<Form
				form={searchForm}
				layout="inline"
				onFinish={handleSearch}
				className="mb-4"
			>
				<Form.Item name="orderNumber" label="订单号">
					<Input
						placeholder="请输入订单号"
						allowClear
						style={{ width: 180 }}
					/>
				</Form.Item>
				<Form.Item name="status" label="状态" initialValue="">
					<Select options={statusOptions} style={{ width: 120 }} />
				</Form.Item>
				<Form.Item name="dateRange" label="下单时间">
					<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type="primary" htmlType="submit">
							搜索
						</Button>
						<Button onClick={handleReset}>重置</Button>
					</Space>
				</Form.Item>
			</Form>

			<Table
				rowKey="orderId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 1000 }}
			/>

			<OrderDetailModal
				open={detailModalVisible}
				orderNumber={currentOrderNumber}
				onClose={() => setDetailModalVisible(false)}
			/>

			<DeliveryModal
				open={deliveryModalVisible}
				orderNumber={currentOrderNumber}
				onOk={() => {
					setDeliveryModalVisible(false);
					fetchDataSource(pagination.current, pagination.pageSize);
				}}
				onCancel={() => setDeliveryModalVisible(false)}
			/>
		</div>
	);
}
