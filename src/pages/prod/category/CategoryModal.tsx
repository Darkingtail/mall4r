import { PlusOutlined } from "@ant-design/icons";
import {
	App,
	Cascader,
	Form,
	Input,
	InputNumber,
	Modal,
	Radio,
	Upload,
	type UploadFile,
	type UploadProps,
} from "antd";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { type Category, categoryApi } from "@/service/api/prod/category";

export type CategoryModalType = "add" | "update";

interface CategoryModalProps {
	open: boolean;
	type: CategoryModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

// 将分类列表转换为 Cascader 的 options 格式
function convertCategoriesToCascaderOptions(
	categories: Category[],
	excludeId?: number,
): any[] {
	return categories
		.filter((cat) => cat.categoryId !== excludeId) // 排除当前编辑的分类
		.map((cat) => ({
			value: cat.categoryId,
			label: cat.categoryName,
			children:
				cat.categories && cat.categories.length > 0
					? convertCategoriesToCascaderOptions(cat.categories, excludeId)
					: undefined,
		}));
}

// 根据 parentId 找到完整的路径数组
function findCategoryPath(categories: Category[], targetId: number): number[] {
	for (const category of categories) {
		if (category.categoryId === targetId) {
			return [category.categoryId];
		}
		if (category.categories && category.categories.length > 0) {
			const childPath = findCategoryPath(category.categories, targetId);
			if (childPath.length > 0) {
				return [category.categoryId, ...childPath];
			}
		}
	}
	return [];
}

export default function CategoryModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: CategoryModalProps) {
	const [form] = Form.useForm();
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [categories, setCategories] = useState<Category[]>([]);
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const { message } = App.useApp();

	const title = useMemo(
		() => (type === "add" ? "新增分类" : "修改分类"),
		[type],
	);

	useEffect(() => {
		if (open) {
			// 加载分类列表用于级联选择
			categoryApi
				.listCategory()
				.then((data) => {
					setCategories(data);

					// 如果是编辑模式，加载分类详情
					if (type === "update" && editingId) {
						categoryApi
							.getInfo(editingId)
							.then((info) => {
								// 找到上级分类路径
								const parentPath =
									info.parentId && info.parentId !== 0
										? findCategoryPath(data, info.parentId)
										: [];

								form.setFieldsValue({
									categoryName: info.categoryName,
									parentId: parentPath.length > 0 ? parentPath : undefined,
									seq: info.seq ?? 0,
									status: info.status ?? 1,
								});

								// 设置图片
								if (info.pic) {
									setFileList([
										{
											uid: "-1",
											name: "category-image",
											status: "done",
											url: info.pic,
										},
									]);
								}
							})
							.catch((err) => {
								console.error(err);
								message.error("获取分类详情失败");
							});
					} else {
						// 新增模式，重置表单
						form.resetFields();
						form.setFieldsValue({
							status: 1,
							seq: 0,
						});
						setFileList([]);
					}
				})
				.catch((err) => {
					console.error(err);
					message.error("获取分类列表失败");
				});
		}
	}, [open, type, editingId, form, message]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();

			// 检查图片
			if (fileList.length === 0) {
				message.error("请上传分类图片");
				return;
			}

			setConfirmLoading(true);

			// 组装图片URL
			let pic = "";
			if (fileList[0].url) {
				pic = fileList[0].url;
			} else if (fileList[0].response?.data) {
				pic = `http://localhost:8085/mall4j/img/${fileList[0].response.data}`;
			}

			// 计算 grade (根据选择的上级分类层级)
			const parentIdArray = values.parentId || [];
			const grade = parentIdArray.length;
			const parentId =
				parentIdArray.length > 0
					? parentIdArray[parentIdArray.length - 1]
					: 0;

			const formData = {
				categoryId: type === "update" ? editingId! : undefined,
				categoryName: values.categoryName,
				parentId,
				grade,
				seq: values.seq ?? 0,
				status: values.status ?? 1,
				pic,
			};

			if (type === "add") {
				await categoryApi.add(formData);
				message.success("新增成功");
			} else {
				await categoryApi.update(formData);
				message.success("修改成功");
			}

			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setConfirmLoading(false);
		}
	};

	const handleCancel = () => {
		form.resetFields();
		setFileList([]);
		onCancel();
	};

	// 图片上传配置
	const uploadProps: UploadProps = {
		action: "/api/admin/file/upload/element",
		listType: "picture-card",
		fileList,
		name: "file",
		maxCount: 1,
		headers: {
			Authorization: Cookies.get("Authorization") || "",
		},
		onChange({ fileList: newFileList }) {
			setFileList(newFileList);
		},
		onPreview(file) {
			window.open(file.url || file.response?.data, "_blank");
		},
	};

	return (
		<Modal
			title={title}
			open={open}
			confirmLoading={confirmLoading}
			onOk={handleOk}
			onCancel={handleCancel}
			destroyOnClose
			width={600}
		>
			<Form
				form={form}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 16 }}
				initialValues={{ status: 1, seq: 0 }}
			>
				<Form.Item label="分类图片" required>
					<Upload {...uploadProps}>
						{fileList.length >= 1 ? null : (
							<button style={{ border: 0, background: "none" }} type="button">
								<PlusOutlined />
								<div style={{ marginTop: 8 }}>上传图片</div>
							</button>
						)}
					</Upload>
				</Form.Item>

				<Form.Item
					label="分类名称"
					name="categoryName"
					rules={[
						{ required: true, message: "请输入分类名称" },
						{ whitespace: true, message: "分类名称不能为空" },
					]}
				>
					<Input placeholder="请输入分类名称" maxLength={50} />
				</Form.Item>

				<Form.Item label="上级分类" name="parentId">
					<Cascader
						options={convertCategoriesToCascaderOptions(
							categories,
							type === "update" ? editingId! : undefined,
						)}
						placeholder="不选择则为顶级分类"
						changeOnSelect
						allowClear
					/>
				</Form.Item>

				<Form.Item label="排序号" name="seq">
					<InputNumber min={0} precision={0} style={{ width: "100%" }} />
				</Form.Item>

				<Form.Item label="状态" name="status">
					<Radio.Group>
						<Radio value={1}>正常</Radio>
						<Radio value={0}>下线</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Modal>
	);
}
