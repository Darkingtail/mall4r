import { type Spec, specApi } from "@/service/api/prod/spec";
import {
	App,
	Button,
	Form,
	Input,
	Popconfirm,
	Space,
	Table,
	Tag,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import SpecModal, { type SpecModalType } from "./SpecModal";

export default function SpecPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<Spec[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<SpecModalType>("add");
	const [editingRecord, setEditingRecord] = useState<Spec | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (page = 1, size = 10, propName?: string) => {
			setLoading(true);
			try {
				const res = await specApi.fetchPage({
					current: page,
					size,
					propName,
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

	const handleSearch = (values: { propName?: string }) => {
		fetchDataSource(1, pagination.pageSize, values.propName);
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
			values.propName,
		);
	};

	const handleDelete = async (propId: number) => {
		try {
			await specApi.delete(propId);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: SpecModalType, record?: Spec) => {
		setModalType(type);
		setEditingRecord(record || null);
		setModalVisible(true);
	};

	const columns: ColumnsType<Spec> = [
		{
			title: "属性名称",
			dataIndex: "propName",
			key: "propName",
			width: 200,
		},
		{
			title: "属性值",
			dataIndex: "prodPropValues",
			key: "prodPropValues",
			render: (values: Spec["prodPropValues"]) => (
				<Space wrap>
					{values?.map((item) => (
						<Tag key={item.valueId} color="blue">
							{item.propValue}
						</Tag>
					))}
				</Space>
			),
		},
		{
			title: "操作",
			key: "action",
			width: 150,
			align: "center",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						size="small"
						onClick={() => openModal("update", record)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除吗？"
						onConfirm={() => handleDelete(record.propId)}
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
				<Form.Item name="propName" label="属性名称">
					<Input placeholder="请输入属性名称" allowClear />
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type="primary" htmlType="submit">
							搜索
						</Button>
						<Button onClick={handleReset}>重置</Button>
						<Button type="primary" onClick={() => openModal("add")}>
							新增
						</Button>
					</Space>
				</Form.Item>
			</Form>

			<Table
				rowKey="propId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
			/>

			<SpecModal
				open={modalVisible}
				type={modalType}
				editingRecord={editingRecord}
				onOk={() => {
					setModalVisible(false);
					fetchDataSource(pagination.current, pagination.pageSize);
				}}
				onCancel={() => setModalVisible(false)}
			/>
		</div>
	);
}
