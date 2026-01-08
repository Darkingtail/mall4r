import { createProdListApi, type ProdListItem } from "@/service/api/prod/prod-list";
import { Button, Image, message, Popconfirm, Space, Table, type TableColumnsType } from "antd";

export default function SearchTable({
	loading,
	dataSource,
	total,
	current,
	size,
	onPageSizeChange,
	onPaginationChange,
	onSelectionChange,
	onRefresh,
	onEdit,
}: {
	loading?: boolean;
	dataSource?: ProdListItem[];
	total: number;
	current: number;
	size: number;
	onPageSizeChange?: (size: number) => void;
	onPaginationChange?: (page: number) => void;
	onSelectionChange?: (selectedRowKeys: React.Key[]) => void;
	onRefresh?: () => void;
	onEdit?: (prodId: number) => void;
}) {
	const dictData = [
		{
			label: "未上架",
			value: 0,
		},
		{
			label: "上架",
			value: 1,
		},
	];
	const handleEdit = (record: ProdListItem) => {
		if (record.prodId) {
			onEdit?.(record.prodId);
		}
	};
	const handleDelete = (record: ProdListItem) => {
		const { delete: deleteSingle } = createProdListApi();
		deleteSingle(record.prodId as number).then(() => {
			message.success("删除成功");
			onRefresh?.();
		});
	};
	const handleToggleStatus = (record: ProdListItem) => {
		const { updateProdStatus } = createProdListApi();
		const newStatus = record.status === 1 ? 0 : 1;
		updateProdStatus(record.prodId as number, newStatus).then(() => {
			message.success(newStatus === 1 ? "上架成功" : "下架成功");
			onRefresh?.();
		});
	};
	const columns: TableColumnsType<ProdListItem> = [
		{ title: "产品名称", dataIndex: "prodName" },
		{ title: "产品原价", dataIndex: "oriPrice" },
		{ title: "商品现价", dataIndex: "price" },
		{ title: "商品库存", dataIndex: "totalStocks" },
		{
			title: "产品图片",
			dataIndex: "pic",
			render(_, record) {
				return <Image width={50} alt="basic" src={record.pic} />;
			},
		},
		{
			title: "状态",
			dataIndex: "status",
			render(_, record) {
				return dictData.find((item) => item.value === record.status)?.label ?? "未知";
			},
		},
		{
			title: "操作",
			key: "action",
			render: (_, record) => (
				<Space size="middle">
					<Button type="link" onClick={() => handleEdit(record)}>
						编辑
					</Button>
					<Button type="link" onClick={() => handleToggleStatus(record)}>
						{record.status === 1 ? "下架" : "上架"}
					</Button>
					<Popconfirm
						title="确定删除吗？"
						onConfirm={() => handleDelete(record)}
						okText="确定"
						cancelText="取消"
					>
						<Button type="link">删除</Button>
					</Popconfirm>
				</Space>
			),
		},
	];
	const handlePageChange = (page: number) => {
		onPaginationChange?.(page);
	};
	const handlePageSizeChange = (_: number, size: number) => {
		onPageSizeChange?.(size);
	};
	return (
		<Table<ProdListItem>
			className="mt-2"
			rowKey="prodId"
			loading={loading}
			columns={columns}
			dataSource={dataSource}
			pagination={{
				position: ["bottomLeft"],
				showQuickJumper: true,
				showSizeChanger: true,
				showTotal: (total) => `Total ${total} items`,
				current,
				total,
				pageSize: size,
				onChange: handlePageChange,
				onShowSizeChange: handlePageSizeChange,
			}}
			rowSelection={{
				onChange: (selectedRowKeys: React.Key[]) => {
					onSelectionChange?.(selectedRowKeys);
				},
			}}
		/>
	);
}
