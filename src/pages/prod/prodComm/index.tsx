import { type ProdComm, prodCommApi } from "@/service/api/prod/prodComm";
import {
	App,
	Button,
	Form,
	Image,
	Input,
	Popconfirm,
	Rate,
	Select,
	Space,
	Table,
	Tag,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import ReplyModal from "./ReplyModal";

const statusOptions = [
	{ label: "全部", value: "" },
	{ label: "待审核", value: 0 },
	{ label: "审核通过", value: 1 },
	{ label: "审核不通过", value: -1 },
];

const evaluateOptions = [
	{ label: "全部", value: "" },
	{ label: "好评", value: 0 },
	{ label: "中评", value: 1 },
	{ label: "差评", value: 2 },
];

const evaluateMap: Record<number, { text: string; color: string }> = {
	0: { text: "好评", color: "green" },
	1: { text: "中评", color: "orange" },
	2: { text: "差评", color: "red" },
};

const statusMap: Record<number, { text: string; color: string }> = {
	0: { text: "待审核", color: "processing" },
	1: { text: "已通过", color: "success" },
	"-1": { text: "不通过", color: "error" },
};

export default function ProdCommPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<ProdComm[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();
	const [replyModalVisible, setReplyModalVisible] = useState(false);
	const [currentRecord, setCurrentRecord] = useState<ProdComm | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (
			page = 1,
			size = 10,
			prodName?: string,
			status?: number | "",
			evaluate?: number | "",
		) => {
			setLoading(true);
			try {
				const res = await prodCommApi.fetchPage({
					current: page,
					size,
					prodName,
					status: status === "" ? undefined : status,
					evaluate: evaluate === "" ? undefined : evaluate,
				});
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
		prodName?: string;
		status?: number | "";
		evaluate?: number | "";
	}) => {
		fetchDataSource(
			1,
			pagination.pageSize,
			values.prodName,
			values.status,
			values.evaluate,
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
			values.prodName,
			values.status,
			values.evaluate,
		);
	};

	const handleDelete = async (prodCommId: number) => {
		try {
			await prodCommApi.delete(prodCommId);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openReplyModal = (record: ProdComm) => {
		setCurrentRecord(record);
		setReplyModalVisible(true);
	};

	const getPics = (pics: string | string[]): string[] => {
		if (!pics) return [];
		if (Array.isArray(pics)) return pics;
		return pics.split(",").filter(Boolean);
	};

	const columns: ColumnsType<ProdComm> = [
		{
			title: "商品名称",
			dataIndex: "prodName",
			key: "prodName",
			width: 150,
			ellipsis: true,
		},
		{
			title: "用户",
			dataIndex: "user",
			key: "user",
			width: 120,
			render: (user, record) => {
				if (record.isAnonymous === 1) {
					return <span className="text-gray-400">匿名用户</span>;
				}
				return user?.nickName || record.userId || "-";
			},
		},
		{
			title: "评论内容",
			dataIndex: "content",
			key: "content",
			width: 200,
			ellipsis: true,
		},
		{
			title: "晒图",
			dataIndex: "pics",
			key: "pics",
			width: 120,
			render: (pics) => {
				const picList = getPics(pics);
				if (picList.length === 0) return "-";
				return (
					<Image.PreviewGroup>
						<Space>
							{picList.slice(0, 3).map((pic, index) => (
								<Image
									key={`${pic}-${index}`}
									src={pic}
									width={40}
									height={40}
									style={{ objectFit: "cover" }}
								/>
							))}
							{picList.length > 3 && (
								<span className="text-gray-400">+{picList.length - 3}</span>
							)}
						</Space>
					</Image.PreviewGroup>
				);
			},
		},
		{
			title: "评分",
			dataIndex: "score",
			key: "score",
			width: 140,
			render: (score) => <Rate disabled value={score} />,
		},
		{
			title: "评价",
			dataIndex: "evaluate",
			key: "evaluate",
			width: 80,
			align: "center",
			render: (evaluate) => {
				const item = evaluateMap[evaluate];
				return item ? <Tag color={item.color}>{item.text}</Tag> : "-";
			},
		},
		{
			title: "状态",
			dataIndex: "status",
			key: "status",
			width: 90,
			align: "center",
			render: (status) => {
				const item = statusMap[status];
				return item ? <Tag color={item.color}>{item.text}</Tag> : "-";
			},
		},
		{
			title: "回复状态",
			dataIndex: "replySts",
			key: "replySts",
			width: 90,
			align: "center",
			render: (replySts) =>
				replySts === 1 ? (
					<Tag color="success">已回复</Tag>
				) : (
					<Tag color="default">未回复</Tag>
				),
		},
		{
			title: "评论时间",
			dataIndex: "recTime",
			key: "recTime",
			width: 160,
		},
		{
			title: "操作",
			key: "action",
			width: 120,
			align: "center",
			fixed: "right",
			render: (_, record) => (
				<Space>
					<Button type="link" size="small" onClick={() => openReplyModal(record)}>
						{record.replySts === 1 ? "查看" : "回复"}
					</Button>
					<Popconfirm
						title="确定删除该评论吗？"
						onConfirm={() => handleDelete(record.prodCommId)}
					>
						<Button type="link" danger size="small">
							删除
						</Button>
					</Popconfirm>
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
				<Form.Item name="prodName" label="商品名称">
					<Input placeholder="请输入商品名称" allowClear style={{ width: 160 }} />
				</Form.Item>
				<Form.Item name="status" label="状态" initialValue="">
					<Select options={statusOptions} style={{ width: 120 }} />
				</Form.Item>
				<Form.Item name="evaluate" label="评价" initialValue="">
					<Select options={evaluateOptions} style={{ width: 100 }} />
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
				rowKey="prodCommId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 1300 }}
			/>

			<ReplyModal
				open={replyModalVisible}
				record={currentRecord}
				onOk={() => {
					setReplyModalVisible(false);
					fetchDataSource(pagination.current, pagination.pageSize);
				}}
				onCancel={() => setReplyModalVisible(false)}
			/>
		</div>
	);
}
