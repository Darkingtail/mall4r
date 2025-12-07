import { useState } from "react";
import SearchForm from "./search-form";
import type { FormValues } from "./search-form";
export default function ProdList() {
	const [current, setCurrent] = 
	useState(1);

	const onSearch = (values: FormValues) => {
		console.log("Search values:", values);
	};
	return (
		<>
			<SearchForm onSearch={onSearch} />
		</>
	);
}
