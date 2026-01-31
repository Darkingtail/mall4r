import { type Area, areaApi } from "@/service/api/delivery/area";
import { App, Button, Input, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import AreaModal, { type AreaModalType } from "./AreaModal";

const levelMap: Record<number, { label: string; color: string }> = {
	1: { label: "省", color: "blue" },
	2: { label: "市", color: "green" },
	3: { label: "区/县", color: "orange" },
	4: { label: "镇/街道", color: "purple" },
};

export default function AreaPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<Area[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchName, setSearchName] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<AreaModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (page = 1, size = 10, areaName = "") => {
			setLoading(true);
			try {
				const res = await areaApi.fetchPage({
					current: page,
					size,
					areaName,
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

	const handleTableChange = (newPagination: TablePaginationConfig) => {
		fetchDataSource(newPagination.current, newPagination.pageSize, searchName);
	};

	const handleSearch = () => {
		fetchDataSource(1, pagination.pageSize, searchName);
	};

	const handleDelete = async (areaId: number) => {
		try {
			await areaApi.delete(areaId);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize, searchName);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: AreaModalType, areaId?: number) => {
		setModalType(type);
		setEditingId(areaId ?? null);
		setModalVisible(true);
	};

	const columns: ColumnsType<Area> = [
		{
			title: "区域ID",
			dataIndex: "areaId",
			key: "areaId",
			width: 100,
		},
		{
			title: "区域名称",
			dataIndex: "areaName",
			key: "areaName",
			width: 200,
		},
		{
			title: "级别",
			dataIndex: "level",
			key: "level",
			width: 100,
			align: "center",
			render: (level) => {
				const info = levelMap[level] || { label: `级别${level}`, color: "default" };
				return <Tag color={info.color}>{info.label}</Tag>;
			},
		},
		{
			title: "上级区域ID",
			dataIndex: "parentId",
			key: "parentId",
			width: 120,
			render: (val) => val || "-",
		},
		{
			title: "操作",
			key: "action",
			width: 120,
			align: "center",
			fixed: "right",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						size="small"
						onClick={() => openModal("update", record.areaId)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该区域吗？"
						description="删除后下级区域也会被删除"
						onConfirm={() => handleDelete(record.areaId!)}
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
			<div className="mb-4 flex items-center justify-between">
				<Space>
					<Input
						placeholder="区域名称"
						value={searchName}
						onChange={(e) => setSearchName(e.target.value)}
						onPressEnter={handleSearch}
						style={{ width: 200 }}
					/>
					<Button type="primary" onClick={handleSearch}>
						搜索
					</Button>
				</Space>
				<Button type="primary" onClick={() => openModal("add")}>
					新增区域
				</Button>
			</div>

			<Table
				rowKey="areaId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 700 }}
			/>

			<AreaModal
				open={modalVisible}
				type={modalType}
				editingId={editingId}
				onOk={() => {
					setModalVisible(false);
					fetchDataSource(pagination.current, pagination.pageSize, searchName);
				}}
				onCancel={() => setModalVisible(false)}
			/>
		</div>
	);
}
