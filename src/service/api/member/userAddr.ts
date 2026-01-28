import { type HttpClient, httpClient } from "@/service";

export interface UserAddr {
	addrId?: number;
	userId?: string;
	receiver: string;
	provinceId?: number;
	province: string;
	cityId?: number;
	city: string;
	areaId?: number;
	area: string;
	addr: string;
	postCode?: string;
	mobile: string;
	status?: number; // 1:正常 0:无效
	commonAddr?: number; // 1:默认地址
	createTime?: string;
	updateTime?: string;
}

export interface FetchUserAddrPageRequest {
	current: number;
	size: number;
}

export interface FetchUserAddrPageResponse {
	current: number;
	pages: number;
	records: UserAddr[];
	size: number;
	total: number;
}

const USER_ADDR_BASE_PATH = "/user/addr";

export function createUserAddrApi(client: HttpClient = httpClient) {
	return {
		// 分页获取用户地址列表
		fetchPage(
			params: FetchUserAddrPageRequest,
		): Promise<FetchUserAddrPageResponse> {
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
				? `${USER_ADDR_BASE_PATH}/page?${urlParams}`
				: `${USER_ADDR_BASE_PATH}/page`;
			return client.get<FetchUserAddrPageResponse, FetchUserAddrPageResponse>(
				url,
			);
		},
		// 获取地址详情
		getById(addrId: number): Promise<UserAddr> {
			return client.get<UserAddr, UserAddr>(
				`${USER_ADDR_BASE_PATH}/info/${addrId}`,
			);
		},
		// 新增地址
		add(data: UserAddr): Promise<void> {
			return client.post(USER_ADDR_BASE_PATH, data);
		},
		// 更新地址
		update(data: UserAddr): Promise<void> {
			return client.put(USER_ADDR_BASE_PATH, data);
		},
		// 删除地址
		delete(addrId: number): Promise<void> {
			return client.delete(`${USER_ADDR_BASE_PATH}/${addrId}`);
		},
	};
}

export const userAddrApi = createUserAddrApi();
