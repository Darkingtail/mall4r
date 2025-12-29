import { PlusOutlined } from "@ant-design/icons";
import {
	Cascader,
	Checkbox,
	Form,
	Input,
	message,
	Modal,
	Radio,
	Select,
	Upload,
	type UploadFile,
	type UploadProps,
} from "antd";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { categoryApi, type Category } from "@/service/api/prod/category";
import { prodListApi, type ProductDetail } from "@/service/api/prod/prod-list";
import { prodTagApi, type ProdTag } from "@/service/api/prod/tag";

const { TextArea } = Input;

interface DetailModalProps {
	isModalOpen: boolean;
	setIsModalOpen: (open: boolean) => void;
	type?: "add" | "edit";
	prodId?: number;
	onSuccess?: () => void;
}

// 将分类列表转换为 Cascader 的 options 格式
function convertCategoriesToCascaderOptions(categories: Category[]): any[] {
	return categories.map((cat) => ({
		value: cat.categoryId,
		label: cat.categoryName,
		// 注意：后端返回的字段是 categories，不是 children
		children: cat.categories && cat.categories.length > 0
			? convertCategoriesToCascaderOptions(cat.categories)
			: undefined,
	}));
}

// 根据 categoryId 找到完整的路径数组（如 [1, 3, 5]）
function findCategoryPath(categories: Category[], targetId: number): number[] {
	for (const category of categories) {
		if (category.categoryId === targetId) {
			return [category.categoryId];
		}
		// 注意：后端返回的字段是 categories，不是 children
		if (category.categories && category.categories.length > 0) {
			const childPath = findCategoryPath(category.categories, targetId);
			if (childPath.length > 0) {
				return [category.categoryId, ...childPath];
			}
		}
	}
	return [];
}

export default function DetailModal({
	isModalOpen,
	setIsModalOpen,
	type = "add",
	prodId,
	onSuccess,
}: DetailModalProps) {
	const [form] = Form.useForm();
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [tags, setTags] = useState<ProdTag[]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	// 加载分类和标签数据
	useEffect(() => {
		if (isModalOpen) {
			// 先加载分类和标签列表
			Promise.all([
				categoryApi.listProdCategory(),
				prodTagApi.listTagList(),
			])
				.then(([categoryData, tagData]) => {
					console.log("分类数据:", categoryData); // 调试：查看分类数据结构
					setCategories(categoryData);
					setTags(tagData);

					// 分类和标签加载完成后，如果是编辑模式，再加载商品数据
					if (type === "edit" && prodId) {
						prodListApi
							.info(prodId)
							.then((data) => {
								console.log("后端返回的商品数据:", data); // 调试：查看完整数据
								console.log("图片字段 imgs:", data.imgs); // 调试：查看图片字段

								// 解析 deliveryMode JSON 字符串
								let deliveryModeObj = { hasShopDelivery: false, hasUserPickUp: false };
								if (data.deliveryMode) {
									try {
										deliveryModeObj = JSON.parse(data.deliveryMode);
									} catch (e) {
										console.error("解析 deliveryMode 失败:", e);
									}
								} else if (data.deliveryModeVo) {
									deliveryModeObj = data.deliveryModeVo;
								}

								// 将 categoryId 转换为路径数组
								const categoryPath = findCategoryPath(categoryData, data.categoryId);

								// 设置表单值
								form.setFieldsValue({
									prodName: data.prodName,
									brief: data.brief,
									categoryId: categoryPath, // 使用路径数组而非单个 ID
									tagList: data.tagList,
									status: data.status ?? 1,
									hasShopDelivery: deliveryModeObj.hasShopDelivery ?? false,
									hasUserPickUp: deliveryModeObj.hasUserPickUp ?? false,
								});

								// 设置图片列表
								if (data.imgs) {
									const images = data.imgs.split(",").map((url, index) => ({
										uid: `${-index - 1}`,
										name: `image${index + 1}.jpg`,
										status: "done" as const,
										url: url.trim(), // 去除可能的空格
										thumbUrl: url.trim(), // 添加缩略图地址
									}));
									console.log("组装的图片列表:", images); // 调试：查看图片列表
									setFileList(images);
								}
							})
							.catch((error) => {
								console.error("获取商品详情失败:", error);
								message.error("获取商品详情失败");
							});
					}
				})
				.catch((error) => {
					console.error("获取基础数据失败:", error);
					message.error("获取基础数据失败");
				});
		}
	}, [isModalOpen, type, prodId, form]);

	const handleOk = () => {
		form
			.validateFields()
			.then((values) => {
				// 检查图片
				if (fileList.length === 0) {
					message.error("请上传商品图片");
					return;
				}

				setConfirmLoading(true);

				// 组装图片URL（逗号分隔）
				// 后端返回格式：{ code: "00000", data: "2025/12/xxx.jpg", ... }
				const imgs = fileList
					.map((file) => {
						// 如果是已有图片（编辑模式回显），使用 file.url
						if (file.url) {
							return file.url;
						}
						// 如果是新上传的图片，从 response.data 获取文件路径
						if (file.response && file.response.data) {
							// 拼接完整URL: http://localhost:8085/mall4j/img/ + 文件路径
							return `http://localhost:8085/mall4j/img/${file.response.data}`;
						}
						return null;
					})
					.filter(Boolean)
					.join(",");

				console.log("组装后的图片URLs:", imgs); // 调试日志

				// 创建默认 SKU（暂不实现规格界面，使用默认值）
				const defaultSku = {
					properties: "",
					oriPrice: 0,
					price: 0,
					stocks: 0,
					actualStocks: 0,
					pic: imgs.split(",")[0], // 使用商品主图
					skuName: "",
					prodName: values.prodName, // 使用商品名称
					status: 1, // 启用
				};

				// 组装商品数据
				const productData: ProductDetail = {
					prodId: type === "edit" ? prodId : undefined,
					prodName: values.prodName,
					price: 0, // 从 SKU 计算，暂时为0
					oriPrice: 0, // 从 SKU 计算，暂时为0
					totalStocks: 0, // 从 SKU 计算，暂时为0
					brief: values.brief,
					pic: imgs.split(",")[0], // 第一张图作为主图
					imgs,
					categoryId: values.categoryId[values.categoryId.length - 1], // 取级联选择的最后一级
					tagList: values.tagList,
					status: values.status,
					deliveryModeVo: {
						hasShopDelivery: values.hasShopDelivery,
						hasUserPickUp: values.hasUserPickUp,
					},
					skuList: [defaultSku], // 添加默认 SKU
					content: "", // 产品详情暂为空
				};

				// 调用新增或更新接口
				const apiCall =
					type === "edit" ? prodListApi.update(productData) : prodListApi.add(productData);

				apiCall
					.then(() => {
						message.success(`${type === "edit" ? "更新" : "新增"}成功`);
						handleCancel();
						onSuccess?.();
					})
					.catch((error) => {
						console.error("操作失败:", error);
						message.error(`${type === "edit" ? "更新" : "新增"}失败`);
					})
					.finally(() => {
						setConfirmLoading(false);
					});
			})
			.catch((error) => {
				console.log("表单验证失败:", error);
			});
	};

	const handleCancel = () => {
		form.resetFields();
		setFileList([]);
		setIsModalOpen(false);
	};

	// 图片上传配置
	const uploadProps: UploadProps = {
		action: "/api/admin/file/upload/element",
		listType: "picture-card",
		fileList,
		name: "file",
		headers: {
			// 添加认证 token
			Authorization: Cookies.get("Authorization") || "",
		},
		onChange({ fileList: newFileList }) {
			console.log("上传文件列表:", newFileList); // 调试：查看完整的文件列表
			setFileList(newFileList);
		},
		onPreview(file) {
			window.open(file.url || file.response, "_blank");
		},
	};

	return (
		<Modal
			title={type === "edit" ? "编辑商品" : "新增商品"}
			open={isModalOpen}
			onOk={handleOk}
			onCancel={handleCancel}
			confirmLoading={confirmLoading}
			width={800}
			destroyOnClose
		>
			<Form
				form={form}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 16 }}
				layout="horizontal"
				initialValues={{
					status: 1,
					hasShopDelivery: false,
					hasUserPickUp: false,
				}}
			>
				<Form.Item
					label="商品名称"
					name="prodName"
					rules={[
						{ required: true, message: "请输入商品名称" },
						{ max: 200, message: "商品名称不能超过200个字符" },
					]}
				>
					<Input placeholder="请输入商品名称" maxLength={200} />
				</Form.Item>

				<Form.Item label="商品卖点" name="brief" rules={[{ max: 500, message: "卖点不能超过500个字符" }]}>
					<TextArea
						rows={3}
						maxLength={500}
						placeholder="请输入商品卖点"
						showCount
					/>
				</Form.Item>

				<Form.Item
					label="商品分类"
					name="categoryId"
					rules={[{ required: true, message: "请选择商品分类" }]}
				>
					<Cascader
						options={convertCategoriesToCascaderOptions(categories)}
						placeholder="请选择商品分类"
						changeOnSelect
					/>
				</Form.Item>

				<Form.Item
					label="产品分组"
					name="tagList"
					rules={[{ required: true, message: "请选择产品分组" }]}
				>
					<Select
						mode="multiple"
						placeholder="请选择产品分组"
						options={tags.map((tag) => ({ label: tag.title, value: tag.id }))}
					/>
				</Form.Item>

				<Form.Item label="商品图片" required>
					<Upload {...uploadProps}>
						{fileList.length >= 8 ? null : (
							<button style={{ border: 0, background: "none" }} type="button">
								<PlusOutlined />
								<div style={{ marginTop: 8 }}>上传图片</div>
							</button>
						)}
					</Upload>
				</Form.Item>

				<Form.Item label="状态" name="status">
					<Radio.Group>
						<Radio value={1}>上架</Radio>
						<Radio value={0}>下架</Radio>
					</Radio.Group>
				</Form.Item>

				<Form.Item label="配送方式" required>
					<Form.Item name="hasShopDelivery" valuePropName="checked" noStyle>
						<Checkbox>商家配送</Checkbox>
					</Form.Item>
					<Form.Item name="hasUserPickUp" valuePropName="checked" noStyle>
						<Checkbox style={{ marginLeft: 16 }}>用户自提</Checkbox>
					</Form.Item>
				</Form.Item>
			</Form>
		</Modal>
	);
}
