import { type HttpClient, httpClient } from "@/service";

export interface Notice {
	id?: number;
	title: string;
	content: string;
	status: number; // 1:公布 0:撤回
	isTop: number; // 1:置顶 0:不置顶
	publishTime?: string;
	updateTime?: string;
}

export interface FetchNoticePageRequest {
	current: number;
	size: number;
	title?: string;
	status?: number;
	isTop?: number;
}

export interface FetchNoticePageResponse {
	current: number;
	pages: number;
	records: Notice[];
	size: number;
	total: number;
}

const NOTICE_BASE_PATH = "/shop/notice";

export function createNoticeApi(client: HttpClient = httpClient) {
	return {
		// 分页获取公告列表
		fetchPage(params: FetchNoticePageRequest): Promise<FetchNoticePageResponse> {
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
				? `${NOTICE_BASE_PATH}/page?${urlParams}`
				: `${NOTICE_BASE_PATH}/page`;
			return client.get<FetchNoticePageResponse, FetchNoticePageResponse>(url);
		},
		// 获取公告详情
		getById(id: number): Promise<Notice> {
			return client.get<Notice, Notice>(`${NOTICE_BASE_PATH}/info/${id}`);
		},
		// 新增公告
		add(data: Notice): Promise<void> {
			return client.post(NOTICE_BASE_PATH, data);
		},
		// 更新公告
		update(data: Notice): Promise<void> {
			return client.put(NOTICE_BASE_PATH, data);
		},
		// 删除公告
		delete(id: number): Promise<void> {
			return client.delete(`${NOTICE_BASE_PATH}/${id}`);
		},
	};
}

export const noticeApi = createNoticeApi();
