import React, { useEffect, useState } from "react";
import { Card, Button, Table, Modal, message, Divider, Select, Popconfirm, Form, Input, Row, Col } from "antd";
import Navbar from "../../components/navbar/Navbar";
import axios from "axios";
import "./AdminProfile.css";

const { Option } = Select;

const AdminProfile = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [isCreateUserModalVisible, setIsCreateUserModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
    fetchOrders();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      message.error("Error al cargar los usuarios.");
      console.error(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders");
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      message.error("Error al cargar los pedidos.");
      console.error(error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/updateorders/${orderId}`, { status_id: newStatus });
      message.success("Estado del pedido actualizado correctamente.");
      fetchOrders();
    } catch (error) {
      message.error("Error al actualizar el estado del pedido.");
      console.error(error);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`/api/deleteorders/${orderId}`);
      message.success("Pedido eliminado correctamente.");
      fetchOrders();
    } catch (error) {
      message.error("Error al eliminar el pedido.");
      console.error(error);
    }
  };

  const renderUserStatus = (status) => (status ? "Activo" : "Inactivo");

  const openUserModal = async (user) => {
    try {
      const response = await axios.get(`/api/users/${user.id}`);
      setSelectedUser(response.data);
      setIsUserModalVisible(true);
    } catch (error) {
      message.error("Error al cargar los detalles del usuario.");
      console.error(error);
    }
  };

  const openOrderModal = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
      setIsOrderModalVisible(true);
    } catch (error) {
      message.error("Error al cargar los detalles del pedido.");
      console.error(error);
    }
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    if (value === null) {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status_id === value));
    }
  };

  const openCreateUserModal = () => {
    form.resetFields();
    setIsCreateUserModalVisible(true);
  };

  const handleCreateUser = async (values) => {
    setLoading(true);
    try {
      await axios.post("/api/createusers", {
        ...values,
        address: " ",
        neighborhood: " "
      });
      message.success("Usuario creado exitosamente.");
      fetchUsers();
      setIsCreateUserModalVisible(false);
    } catch (error) {
      message.error("Error al crear el usuario.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserTable = () => {
    const userColumns = [
      { title: "Nombre", dataIndex: "user_name", key: "user_name" },
      { title: "Email", dataIndex: "email", key: "email" },
      { title: "Tipo", dataIndex: "user_type", key: "user_type" },
      {
        title: "Estado",
        dataIndex: "is_active",
        key: "is_active",
        render: renderUserStatus,
      },
      {
        title: "Acciones",
        key: "actions",
        render: (_, user) => (
          <Button onClick={() => openUserModal(user)}>Ver Detalles</Button>
        ),
      },
    ];

    return (
      <Card title="Gestión de Usuarios">
        <Button type="primary" onClick={openCreateUserModal} className="crearUser" >
          Crear Usuario
        </Button>
        <Table
          dataSource={users}
          columns={userColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    );
  };

  const renderOrderTable = () => {
    const orderColumns = [
      { title: "ID de Orden", dataIndex: "id", key: "id" },
      { title: "Cliente", dataIndex: "customer_id", key: "customer_id" },
      {
        title: "Fecha",
        dataIndex: "order_date",
        key: "order_date",
        render: (date) => new Date(date).toLocaleDateString(),
      },
      { title: "Total", dataIndex: "total", key: "total" },
      {
        title: "Estado",
        dataIndex: "status_id",
        key: "status_id",
        render: (status) =>
          status === 1 ? "Pendiente" : status === 2 ? "Enviado" : status === 3 ? "Entregado" : "Cancelado",
      },
      {
        title: "Acciones",
        key: "actions",
        render: (_, order) => (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button onClick={() => openOrderModal(order.id)}>Detalles</Button>
            <Select
              defaultValue={order.status_id}
              onChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
              style={{ width: 120 }}
            >
              <Option value={1}>Pendiente</Option>
              <Option value={2}>Enviado</Option>
              <Option value={3}>Entregado</Option>
              <Option value={4}>Cancelado</Option>
            </Select>
            <Popconfirm
              title="¿Estás seguro de eliminar este pedido?"
              onConfirm={() => deleteOrder(order.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button danger>Eliminar</Button>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return (
      <Card title="Gestión de Pedidos" style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "10px" }}>
          <Select
            placeholder="Filtrar por estado"
            allowClear
            onChange={handleStatusFilterChange}
            style={{ width: 200 }}
          >
            <Option value={1}>Pendiente</Option>
            <Option value={2}>Enviado</Option>
            <Option value={3}>Entregado</Option>
            <Option value={4}>Cancelado</Option>
          </Select>
        </div>
        <Table
          dataSource={filteredOrders}
          columns={orderColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    );
  };

  return (
    <div>
      <Navbar />
      <div className="admin-profile-container">
        <h2>Bienvenido al Panel de Administración</h2>
        <p>Aquí puedes gestionar usuarios y pedidos.</p>
        {renderUserTable()}
        {renderOrderTable()}

        {/* Modal for User Details */}
        <Modal
          title="Detalles de Usuario"
          visible={isUserModalVisible}
          onCancel={() => setIsUserModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsUserModalVisible(false)}>
              Cerrar
            </Button>,
          ]}
        >
          {selectedUser && (
            <>
              <p>
                <strong>Nombre:</strong> {selectedUser.user.user_name}
              </p>
              <p>
                <strong>Apellido:</strong> {selectedUser.user.lastname}
              </p>
              <p>
                <strong>Email:</strong> {selectedUser.user.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {selectedUser.user.phone}
              </p>
              <p>
                <strong>Ciudad:</strong> {selectedUser.user.city}
              </p>
              <p>
                <strong>Dirección:</strong> {selectedUser.user.address}
              </p>
              <p>
                <strong>Barrio:</strong> {selectedUser.user.neighborhood}
              </p>
              <p>
                <strong>Tipo:</strong> {selectedUser.user.user_type}
              </p>
              <p>
                <strong>Estado:</strong> {renderUserStatus(selectedUser.user.is_active)}
              </p>
            </>
          )}
        </Modal>

        {/* Modal for Create User */}
        <Modal
          title="Crear Usuario"
          visible={isCreateUserModalVisible}
          onCancel={() => setIsCreateUserModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleCreateUser} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Nombre"
                  name="user_name"
                  rules={[{ required: true, message: "Por favor ingresa el nombre" }]}
                >
                  <Input placeholder="Nombre" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Apellido"
                  name="lastname"
                  rules={[{ required: true, message: "Por favor ingresa el apellido" }]}
                >
                  <Input placeholder="Apellido" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Correo Electrónico"
                  name="email"
                  rules={[
                    { required: true, message: "Por favor ingresa el correo electrónico" },
                    { type: "email", message: "Ingresa un correo electrónico válido" },
                  ]}
                >
                  <Input placeholder="Correo Electrónico" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Teléfono"
                  name="phone"
                  rules={[{ required: true, message: "Por favor ingresa el número de teléfono" }]}
                >
                  <Input placeholder="Teléfono" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Ciudad"
                  name="city"
                  rules={[{ required: true, message: "Por favor selecciona la ciudad" }]}
                >
                  <Select placeholder="Selecciona una ciudad">
                    <Option value="Chía">Chía</Option>
                    <Option value="Cajicá">Cajicá</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Contraseña"
                  name="user_password"
                  rules={[
                    { required: true, message: "Por favor ingresa una contraseña" },
                    { min: 6, message: "La contraseña debe tener al menos 6 caracteres" },
                  ]}
                >
                  <Input.Password placeholder="Contraseña" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Tipo de Usuario"
              name="user_type"
              rules={[{ required: true, message: "Por favor selecciona el tipo de usuario" }]}
            >
              <Select placeholder="Selecciona un tipo de usuario">
                <Option value="admin">Administrador</Option>
                <Option value="hogar">Hogar</Option>
                <Option value="restaurante">Restaurante</Option>
                <Option value="supermercado">Supermercado</Option>
                <Option value="fruver">Fruver</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block >
                Crear Usuario
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AdminProfile;
