import { type HttpClient, httpClient } from "@/service";
import qs from "qs";

export interface Brand {
	brandId?: number;
	brandName: string;
	brandPic?: string;
	memo?: string;
	seq?: number;
	status?: number; // 1:正常 0:下线
	brief?: string;
	firstChar?: string;
	content?: string;
	recTime?: string;
	updateTime?: string;
}

export interface FetchBrandPageRequest {
	current: number;
	size: number;
	brandName?: string;
}

export interface FetchBrandPageResponse {
	current: number;
	pages: number;
	records: Brand[];
	size: number;
	total: number;
}

const BRAND_BASE_PATH = "/admin/brand";

export function createBrandApi(client: HttpClient = httpClient) {
	return {
		// 分页获取品牌列表
		fetchPage(params: FetchBrandPageRequest): Promise<FetchBrandPageResponse> {
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
				? `${BRAND_BASE_PATH}/page?${urlParams}`
				: `${BRAND_BASE_PATH}/page`;
			return client.get<FetchBrandPageResponse, FetchBrandPageResponse>(url);
		},
		// 获取品牌详情
		getById(brandId: number): Promise<Brand> {
			return client.get<Brand, Brand>(`${BRAND_BASE_PATH}/info/${brandId}`);
		},
		// 新增品牌 (使用 form data)
		add(data: Brand): Promise<void> {
			return client.post(BRAND_BASE_PATH, qs.stringify(data), {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			});
		},
		// 更新品牌 (使用 form data)
		update(data: Brand): Promise<void> {
			return client.put(BRAND_BASE_PATH, qs.stringify(data), {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			});
		},
		// 删除品牌
		delete(brandId: number): Promise<void> {
			return client.delete(`${BRAND_BASE_PATH}/${brandId}`);
		},
	};
}

export const brandApi = createBrandApi();
