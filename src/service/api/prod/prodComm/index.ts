import { type HttpClient, httpClient } from "@/service";

export interface UserVO {
	userId: string;
	nickName: string;
	pic: string;
}

export interface ProdComm {
	prodCommId: number;
	prodId: number;
	orderItemId: number;
	userId: string;
	content: string;
	replyContent: string;
	recTime: string;
	replyTime: string;
	replySts: number; // 0:未回复 1:已回复
	postip: string;
	score: number; // 0-5分
	usefulCounts: number;
	pics: string | string[]; // 晒图，后端可能返回字符串或数组
	isAnonymous: number; // 1:是 0:否
	status: number; // 1:显示 0:待审核 -1:不通过
	evaluate: number; // 0好评 1中评 2差评
	user?: UserVO;
	prodName?: string;
}

export interface FetchProdCommPageRequest {
	current: number;
	size: number;
	prodName?: string;
	status?: number;
	evaluate?: number;
}

export interface FetchProdCommPageResponse {
	current: number;
	pages: number;
	records: ProdComm[];
	size: number;
	total: number;
}

export interface ReplyProdCommRequest {
	prodCommId: number;
	replyContent: string;
	replySts: number;
}

const PROD_COMM_BASE_PATH = "/prod/prodComm";

export function createProdCommApi(client: HttpClient = httpClient) {
	return {
		// 分页获取评论列表
		fetchPage(
			params: FetchProdCommPageRequest,
		): Promise<FetchProdCommPageResponse> {
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
				? `${PROD_COMM_BASE_PATH}/page?${urlParams}`
				: `${PROD_COMM_BASE_PATH}/page`;
			return client.get<FetchProdCommPageResponse, FetchProdCommPageResponse>(
				url,
			);
		},
		// 获取评论详情
		getById(prodCommId: number): Promise<ProdComm> {
			return client.get<ProdComm, ProdComm>(
				`${PROD_COMM_BASE_PATH}/info/${prodCommId}`,
			);
		},
		// 回复评论
		reply(data: ReplyProdCommRequest): Promise<void> {
			return client.put(PROD_COMM_BASE_PATH, data);
		},
		// 删除评论
		delete(prodCommId: number): Promise<void> {
			return client.delete(`${PROD_COMM_BASE_PATH}/${prodCommId}`);
		},
	};
}

export const prodCommApi = createProdCommApi();
