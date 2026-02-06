import { sysUserApi } from "@/service/api/sys/user";
import { type SysRole, sysRoleApi } from "@/service/api/sys/role";
import { App, Form, Input, Modal, Radio, Select } from "antd";
import { useEffect, useState } from "react";

export type SysUserModalType = "add" | "update";

interface SysUserModalProps {
	open: boolean;
	type: SysUserModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

export default function SysUserModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: SysUserModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [roleList, setRoleList] = useState<SysRole[]>([]);
	const { message } = App.useApp();

	// 加载角色列表
	useEffect(() => {
		if (open) {
			sysRoleApi.listAll().then(setRoleList).catch(console.error);
		}
	}, [open]);

	// 加载表单数据
	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				sysUserApi
					.getById(editingId)
					.then((data) => {
						form.setFieldsValue(data);
					})
					.catch(console.error)
					.finally(() => setFetching(false));
			} else {
				form.resetFields();
				form.setFieldsValue({ status: 1 });
			}
		}
	}, [open, type, editingId, form]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			if (type === "add") {
				await sysUserApi.add(values);
				message.success("新增成功");
			} else {
				await sysUserApi.update({ ...values, userId: editingId });
				message.success("更新成功");
			}

			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title={type === "add" ? "新增管理员" : "编辑管理员"}
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnHidden
			width={550}
		>
			<Form
				form={form}
				layout="horizontal"
				labelCol={{ span: 5 }}
				wrapperCol={{ span: 18 }}
				disabled={fetching}
			>
				<Form.Item
					name="username"
					label="用户名"
					rules={[
						{ required: true, message: "请输入用户名" },
						{ min: 2, max: 20, message: "用户名长度为2-20个字符" },
					]}
				>
					<Input
						placeholder="请输入用户名"
						maxLength={20}
						disabled={type === "update"}
					/>
				</Form.Item>

				<Form.Item
					name="password"
					label="密码"
					rules={
						type === "add"
							? [
									{ required: true, message: "请输入密码" },
									{ min: 6, message: "密码长度不能少于6位" },
								]
							: [{ min: 6, message: "密码长度不能少于6位" }]
					}
				>
					<Input.Password
						placeholder={
							type === "add" ? "请输入密码" : "不填则不修改密码"
						}
						maxLength={50}
					/>
				</Form.Item>

				<Form.Item
					name="email"
					label="邮箱"
					rules={[{ type: "email", message: "请输入有效的邮箱地址" }]}
				>
					<Input placeholder="请输入邮箱" maxLength={100} />
				</Form.Item>

				<Form.Item name="mobile" label="手机号">
					<Input placeholder="请输入手机号" maxLength={11} />
				</Form.Item>

				<Form.Item name="roleIdList" label="角色">
					<Select
						mode="multiple"
						placeholder="请选择角色"
						options={roleList.map((role) => ({
							label: role.roleName,
							value: role.roleId,
						}))}
					/>
				</Form.Item>

				<Form.Item name="status" label="状态">
					<Radio.Group>
						<Radio value={1}>正常</Radio>
						<Radio value={0}>禁用</Radio>
					</Radio.Group>
				</Form.Item>
			</Form>
		</Modal>
	);
}
