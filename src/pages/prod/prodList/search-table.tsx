import type { ProdListItem } from "@/service/api/prod/prod-list";
import { Table, type TableColumnsType } from "antd";
import { useState } from "react";

export default function SearchTable({
	onPaginationChange,
}: {
	onPaginationChange?: (page: number) => void;
}) {
	const columns: TableColumnsType<ProdListItem> = [{ title: "Product", dataIndex: "prodName" }];
	const dataSource = Array.from<ProdListItem>({ length: 46 }).map<ProdListItem>((_, i) => ({
		key: i + 1,
		prodName: `Product ${i + 1}`,
	}));

	const [current, setCurrent] = useState(1);

	const handlePageChange = (page: number) => {
		setCurrent(page);
		if (onPaginationChange) {
			onPaginationChange(page);
		}
	};
	return (
		<Table<ProdListItem>
			columns={columns}
			dataSource={dataSource}
			pagination={{ current, onChange: handlePageChange }}
		/>
	);
}
