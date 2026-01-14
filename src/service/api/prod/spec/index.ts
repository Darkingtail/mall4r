import { type HttpClient, httpClient } from "@/service";

export interface ProdPropValue {
	valueId?: number;
	propValue: string;
}

export interface Spec {
	propId: number;
	propName: string;
	prodPropValues: ProdPropValue[];
}

export interface SpecFormData {
	propId?: number;
	propName: string;
	prodPropValues: ProdPropValue[];
}

export interface FetchSpecPageRequest {
	current: number;
	size: number;
	propName?: string;
}

export interface FetchSpecPageResponse {
	current: number;
	pages: number;
	records: Spec[];
	size: number;
	total: number;
}

const SPEC_BASE_PATH = "/prod/spec";

export function createSpecApi(client: HttpClient = httpClient) {
	return {
		// 分页获取规格列表
		fetchPage(params: FetchSpecPageRequest): Promise<FetchSpecPageResponse> {
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
				? `${SPEC_BASE_PATH}/page?${urlParams}`
				: `${SPEC_BASE_PATH}/page`;
			return client.get<FetchSpecPageResponse, FetchSpecPageResponse>(url);
		},
		// 新增规格
		add(data: SpecFormData): Promise<void> {
			return client.post(SPEC_BASE_PATH, data);
		},
		// 更新规格
		update(data: SpecFormData): Promise<void> {
			return client.put(SPEC_BASE_PATH, data);
		},
		// 删除规格
		delete(propId: number): Promise<void> {
			return client.delete(`${SPEC_BASE_PATH}/${propId}`);
		},
	};
}

export const specApi = createSpecApi();
