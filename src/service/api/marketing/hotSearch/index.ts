import { type HttpClient, httpClient } from "@/service";

export interface HotSearch {
	hotSearchId?: number;
	title: string;
	content: string; // 搜索词
	seq: number;
	status: number; // 1:正常 0:下线
	recDate?: string; // 录入时间
}

export interface FetchHotSearchPageRequest {
	current: number;
	size: number;
	title?: string;
	content?: string;
	status?: number;
}

export interface FetchHotSearchPageResponse {
	current: number;
	pages: number;
	records: HotSearch[];
	size: number;
	total: number;
}

const HOT_SEARCH_BASE_PATH = "/admin/hotSearch";

export function createHotSearchApi(client: HttpClient = httpClient) {
	return {
		// 分页获取热搜列表
		fetchPage(
			params: FetchHotSearchPageRequest,
		): Promise<FetchHotSearchPageResponse> {
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
				? `${HOT_SEARCH_BASE_PATH}/page?${urlParams}`
				: `${HOT_SEARCH_BASE_PATH}/page`;
			return client.get<FetchHotSearchPageResponse, FetchHotSearchPageResponse>(
				url,
			);
		},
		// 获取热搜详情
		getById(hotSearchId: number): Promise<HotSearch> {
			return client.get<HotSearch, HotSearch>(
				`${HOT_SEARCH_BASE_PATH}/info/${hotSearchId}`,
			);
		},
		// 新增热搜
		add(data: HotSearch): Promise<void> {
			return client.post(HOT_SEARCH_BASE_PATH, data);
		},
		// 更新热搜
		update(data: HotSearch): Promise<void> {
			return client.put(HOT_SEARCH_BASE_PATH, data);
		},
		// 删除热搜（批量）
		delete(hotSearchIds: number[]): Promise<void> {
			return client.delete(HOT_SEARCH_BASE_PATH, { data: hotSearchIds });
		},
	};
}

export const hotSearchApi = createHotSearchApi();
