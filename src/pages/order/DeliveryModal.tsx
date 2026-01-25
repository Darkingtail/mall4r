import { orderApi } from "@/service/api/order";
import { App, Form, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";

interface DeliveryModalProps {
	open: boolean;
	orderNumber: string | null;
	onOk: () => void;
	onCancel: () => void;
}

// 常用快递公司列表
const DELIVERY_COMPANIES = [
	{ value: 1, label: "顺丰速运" },
	{ value: 2, label: "中通快递" },
	{ value: 3, label: "圆通速递" },
	{ value: 4, label: "申通快递" },
	{ value: 5, label: "韵达快递" },
	{ value: 6, label: "百世快递" },
	{ value: 7, label: "邮政EMS" },
	{ value: 8, label: "京东物流" },
	{ value: 9, label: "极兔速递" },
	{ value: 10, label: "德邦快递" },
];

export default function DeliveryModal({
	open,
	orderNumber,
	onOk,
	onCancel,
}: DeliveryModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const { message } = App.useApp();

	useEffect(() => {
		if (open) {
			form.resetFields();
		}
	}, [open, form]);

	const handleOk = async () => {
		if (!orderNumber) return;

		try {
			const values = await form.validateFields();
			setLoading(true);

			await orderApi.delivery({
				orderNumber,
				dvyId: values.dvyId,
				dvyFlowId: values.dvyFlowId,
			});

			message.success("发货成功");
			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title="订单发货"
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnHidden
			width={500}
		>
			<Form
				form={form}
				layout="horizontal"
				labelCol={{ span: 5 }}
				wrapperCol={{ span: 18 }}
			>
				<Form.Item label="订单号">
					<span className="text-gray-600">{orderNumber}</span>
				</Form.Item>

				<Form.Item
					name="dvyId"
					label="快递公司"
					rules={[{ required: true, message: "请选择快递公司" }]}
				>
					<Select
						placeholder="请选择快递公司"
						options={DELIVERY_COMPANIES}
						showSearch
						optionFilterProp="label"
					/>
				</Form.Item>

				<Form.Item
					name="dvyFlowId"
					label="物流单号"
					rules={[{ required: true, message: "请输入物流单号" }]}
				>
					<Input placeholder="请输入物流单号" maxLength={50} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
