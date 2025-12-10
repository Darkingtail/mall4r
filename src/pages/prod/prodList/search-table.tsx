import type { ProdListItem } from "@/service/api/prod/prod-list";
import { Table, type TableColumnsType } from "antd";

export default function SearchTable({
	dataSource,
	total,
	current,
	size,
	onPageSizeChange,
	onPaginationChange,
}: {
	dataSource?: ProdListItem[];
	total: number;
	current: number;
	size: number;
	onPageSizeChange?: (size: number) => void;
	onPaginationChange?: (page: number) => void;
}) {
	const columns: TableColumnsType<ProdListItem> = [{ title: "Product", dataIndex: "prodName" }];
	const handlePageChange = (page: number) => {
		onPaginationChange?.(page);
	};
	const handlePageSizeChange = (_: number, size: number) => {
		onPageSizeChange?.(size);
	};
	return (
		<Table<ProdListItem>
			className="mt-2"
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
		/>
	);
}
