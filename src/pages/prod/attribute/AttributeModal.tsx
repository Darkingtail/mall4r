import {
	type Attribute,
	type ProdPropValue,
	attributeApi,
} from "@/service/api/prod/attribute";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, Modal, Space } from "antd";
import { useEffect, useMemo, useState } from "react";

export type AttributeModalType = "add" | "update";

interface AttributeModalProps {
	open: boolean;
	type: AttributeModalType;
	editingRecord?: Attribute | null;
	onOk: () => void;
	onCancel: () => void;
}

export default function AttributeModal({
	open,
	type,
	editingRecord,
	onOk,
	onCancel,
}: AttributeModalProps) {
	const [form] = Form.useForm();
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [propValues, setPropValues] = useState<ProdPropValue[]>([
		{ propValue: "" },
	]);

	const { message } = App.useApp();

	const title = useMemo(
		() => (type === "add" ? "新增属性" : "修改属性"),
		[type],
	);

	useEffect(() => {
		if (open) {
			if (type === "update" && editingRecord) {
				form.setFieldsValue({
					propName: editingRecord.propName,
				});
				setPropValues(
					editingRecord.prodPropValues.length > 0
						? editingRecord.prodPropValues.map((v) => ({ ...v }))
						: [{ propValue: "" }],
				);
			} else {
				form.resetFields();
				setPropValues([{ propValue: "" }]);
			}
		}
	}, [open, type, editingRecord, form]);

	const handleAddPropValue = () => {
		setPropValues([...propValues, { propValue: "" }]);
	};

	const handleRemovePropValue = (index: number) => {
		if (propValues.length <= 1) {
			return;
		}
		const newValues = [...propValues];
		newValues.splice(index, 1);
		setPropValues(newValues);
	};

	const handlePropValueChange = (index: number, value: string) => {
		const newValues = [...propValues];
		newValues[index] = { ...newValues[index], propValue: value };
		setPropValues(newValues);
	};

	const handleOk = async () => {
		try {
			const values = await form.validateFields();

			// 过滤空值
			const filteredPropValues = propValues.filter(
				(v) => v.propValue && v.propValue.trim(),
			);

			if (filteredPropValues.length === 0) {
				message.error("请至少添加一个属性值");
				return;
			}

			// 验证属性值长度
			const invalidValue = filteredPropValues.find(
				(v) => v.propValue.length > 20,
			);
			if (invalidValue) {
				message.error("属性值长度不能超过20个字符");
				return;
			}

			setConfirmLoading(true);

			const formData = {
				propId: type === "update" ? editingRecord?.propId : undefined,
				propName: values.propName,
				prodPropValues: filteredPropValues,
			};

			if (type === "add") {
				await attributeApi.add(formData);
				message.success("新增成功");
			} else {
				await attributeApi.update(formData);
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
		setPropValues([{ propValue: "" }]);
		onCancel();
	};

	return (
		<Modal
			title={title}
			open={open}
			confirmLoading={confirmLoading}
			onOk={handleOk}
			onCancel={handleCancel}
			destroyOnHidden
			width={600}
		>
			<Form
				form={form}
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 16 }}
				initialValues={{ propName: "" }}
			>
				<Form.Item
					label="属性名称"
					name="propName"
					rules={[
						{ required: true, message: "请输入属性名称" },
						{ max: 10, message: "属性名称不能超过10个字符" },
					]}
				>
					<Input placeholder="请输入属性名称" maxLength={10} showCount />
				</Form.Item>

				<Form.Item label="属性值" required>
					<div className="space-y-2">
						{propValues.map((item, index) => (
							<Space key={item.valueId ?? index} align="center">
								<Input
									value={item.propValue}
									placeholder="请输入属性值"
									maxLength={20}
									style={{ width: 200 }}
									onChange={(e) =>
										handlePropValueChange(index, e.target.value)
									}
								/>
								{propValues.length > 1 && (
									<Button
										type="text"
										danger
										icon={<CloseOutlined />}
										onClick={() => handleRemovePropValue(index)}
									/>
								)}
							</Space>
						))}
						<div>
							<Button
								type="dashed"
								icon={<PlusOutlined />}
								onClick={handleAddPropValue}
							>
								添加属性值
							</Button>
						</div>
					</div>
				</Form.Item>
			</Form>
		</Modal>
	);
}
