import { type ProdComm, prodCommApi } from "@/service/api/prod/prodComm";
import {
	App,
	Descriptions,
	Form,
	Image,
	Input,
	Modal,
	Rate,
	Space,
	Tag,
} from "antd";
import { useEffect, useState } from "react";

interface ReplyModalProps {
	open: boolean;
	record: ProdComm | null;
	onOk: () => void;
	onCancel: () => void;
}

const evaluateMap: Record<number, { text: string; color: string }> = {
	0: { text: "好评", color: "green" },
	1: { text: "中评", color: "orange" },
	2: { text: "差评", color: "red" },
};

export default function ReplyModal({
	open,
	record,
	onOk,
	onCancel,
}: ReplyModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const { message } = App.useApp();

	const isReplied = record?.replySts === 1;

	useEffect(() => {
		if (open && record) {
			form.setFieldsValue({
				replyContent: record.replyContent || "",
			});
		}
	}, [open, record, form]);

	const handleOk = async () => {
		if (isReplied) {
			onCancel();
			return;
		}

		try {
			const values = await form.validateFields();
			setLoading(true);
			await prodCommApi.reply({
				prodCommId: record!.prodCommId,
				replyContent: values.replyContent,
				replySts: 1,
			});
			message.success("回复成功");
			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const getPics = (pics: string | string[] | undefined): string[] => {
		if (!pics) return [];
		if (Array.isArray(pics)) return pics;
		return pics.split(",").filter(Boolean);
	};

	const picList = getPics(record?.pics);
	const evaluateItem = record ? evaluateMap[record.evaluate] : null;

	return (
		<Modal
			title={isReplied ? "查看评论" : "回复评论"}
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			okText={isReplied ? "关闭" : "回复"}
			cancelText="取消"
			width={600}
			destroyOnHidden
		>
			<Descriptions column={2} bordered size="small" className="mb-4">
				<Descriptions.Item label="商品名称" span={2}>
					{record?.prodName || "-"}
				</Descriptions.Item>
				<Descriptions.Item label="用户">
					{record?.isAnonymous === 1
						? "匿名用户"
						: record?.user?.nickName || record?.userId || "-"}
				</Descriptions.Item>
				<Descriptions.Item label="评分">
					<Rate disabled value={record?.score} />
				</Descriptions.Item>
				<Descriptions.Item label="评价">
					{evaluateItem ? (
						<Tag color={evaluateItem.color}>{evaluateItem.text}</Tag>
					) : (
						"-"
					)}
				</Descriptions.Item>
				<Descriptions.Item label="评论时间">
					{record?.recTime || "-"}
				</Descriptions.Item>
				<Descriptions.Item label="评论内容" span={2}>
					{record?.content || "-"}
				</Descriptions.Item>
				{picList.length > 0 && (
					<Descriptions.Item label="晒图" span={2}>
						<Image.PreviewGroup>
							<Space wrap>
								{picList.map((pic, index) => (
									<Image
										key={`${pic}-${index}`}
										src={pic}
										width={80}
										height={80}
										style={{ objectFit: "cover" }}
									/>
								))}
							</Space>
						</Image.PreviewGroup>
					</Descriptions.Item>
				)}
				{record?.replyTime && (
					<Descriptions.Item label="回复时间" span={2}>
						{record.replyTime}
					</Descriptions.Item>
				)}
			</Descriptions>

			<Form form={form} layout="vertical">
				<Form.Item
					name="replyContent"
					label="回复内容"
					rules={[{ required: !isReplied, message: "请输入回复内容" }]}
				>
					<Input.TextArea
						rows={4}
						placeholder="请输入回复内容"
						disabled={isReplied}
						showCount
						maxLength={500}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
}
