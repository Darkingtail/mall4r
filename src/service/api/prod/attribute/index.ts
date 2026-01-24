import { type HttpClient, httpClient } from "@/service";

export interface ProdPropValue {
	valueId?: number;
	propValue: string;
}

export interface Attribute {
	propId: number;
	propName: string;
	prodPropValues: ProdPropValue[];
}

export interface AttributeFormData {
	propId?: number;
	propName: string;
	prodPropValues: ProdPropValue[];
}

export interface FetchAttributePageRequest {
	current: number;
	size: number;
	propName?: string;
}

export interface FetchAttributePageResponse {
	current: number;
	pages: number;
	records: Attribute[];
	size: number;
	total: number;
}

const ATTRIBUTE_BASE_PATH = "/admin/attribute";

export function createAttributeApi(client: HttpClient = httpClient) {
	return {
		// 分页获取属性列表
		fetchPage(
			params: FetchAttributePageRequest,
		): Promise<FetchAttributePageResponse> {
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
				? `${ATTRIBUTE_BASE_PATH}/page?${urlParams}`
				: `${ATTRIBUTE_BASE_PATH}/page`;
			return client.get<FetchAttributePageResponse, FetchAttributePageResponse>(
				url,
			);
		},
		// 获取属性详情
		getById(propId: number): Promise<Attribute> {
			return client.get<Attribute, Attribute>(
				`${ATTRIBUTE_BASE_PATH}/info/${propId}`,
			);
		},
		// 新增属性
		add(data: AttributeFormData): Promise<void> {
			return client.post(ATTRIBUTE_BASE_PATH, data);
		},
		// 更新属性
		update(data: AttributeFormData): Promise<void> {
			return client.put(ATTRIBUTE_BASE_PATH, data);
		},
		// 删除属性
		delete(propId: number): Promise<void> {
			return client.delete(`${ATTRIBUTE_BASE_PATH}/${propId}`);
		},
	};
}

export const attributeApi = createAttributeApi();
