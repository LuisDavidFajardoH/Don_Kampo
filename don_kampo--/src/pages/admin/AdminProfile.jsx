import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import {
  Card,
  Button,
  Table,
  Modal,
  message,
  Divider,
  Select,
  Popconfirm,
  Form,
  Input,
  Row,
  Col,
} from "antd";
import Navbar from "../../components/navbar/Navbar";
import CustomFooter from "../../components/footer/Footer";

import { SearchOutlined } from "@ant-design/icons";
import BotonWhatsapp from "../../components/botonWhatsapp/BotonWhatsapp";
import axios from "axios";
import * as XLSX from "xlsx";
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
  const [globalSearchText, setGlobalSearchText] = useState("");

  const getFilteredUsers = () => {
    if (!globalSearchText) return users;

    return users.filter((user) => {
      const statusText = renderUserStatus(user.status_id); // Convierte el estado a texto legible
      return (
        (user.user_name &&
          user.user_name.toLowerCase().includes(globalSearchText)) ||
        (user.email && user.email.toLowerCase().includes(globalSearchText)) ||
        (user.user_type &&
          user.user_type.toLowerCase().includes(globalSearchText)) ||
        statusText.toLowerCase().includes(globalSearchText)
      );
    });
  };

  const [isCreateUserModalVisible, setIsCreateUserModalVisible] =
    useState(false);
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
      // Cambiamos la URL para incluir directamente el id y el nuevo estado
      await axios.put(
        `http://localhost:8080/api/updatestatus/${orderId}/${newStatus}`
      );
      message.success("Estado del pedido actualizado correctamente.");
      fetchOrders(); // Refresca la lista de pedidos después de actualizar el estado
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
      form.setFieldsValue(response.data.user); // Actualiza los valores del formulario
    } catch (error) {
      message.error("Error al cargar los detalles del usuario.");
      console.error(error);
    }
  };

  const handleCancelUserModal = () => {
    setIsUserModalVisible(false);
    setSelectedUser(null);
    form.resetFields(); // Limpia el formulario
  };

  const openOrderModal = async (orderId) => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      // Actualiza el estado con toda la respuesta (incluyendo order, items y shippingInfo)
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
      setFilteredOrders(orders.filter((order) => order.status_id === value));
    }
  };

  const updateUserDetails = async (values) => {
    try {
      await axios.put(`/api/updateusers/${selectedUser.user.id}`, values);
      message.success("Usuario actualizado exitosamente.");
      fetchUsers(); // Refresca la lista de usuarios después de actualizar
      setIsUserModalVisible(false);
    } catch (error) {
      message.error("Error al actualizar el usuario.");
      console.error(error);
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
        neighborhood: " ",
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
    const updateUserStatus = async (userId, statusId) => {
      try {
        await axios.put(`/api/userstatus/${userId}/${statusId}`);
        message.success("Estado del usuario actualizado correctamente.");
        fetchUsers(); // Refresca la lista de usuarios después de actualizar
      } catch (error) {
        message.error("Error al actualizar el estado del usuario.");
        console.error(error);
      }
    };
  
    const userColumns = [
      { title: "Nombre", dataIndex: "user_name", key: "user_name" },
      { title: "Apellido", dataIndex: "lastname", key: "lastname" },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        filterDropdown: ({
          setSelectedKeys,
          selectedKeys,
          confirm,
          clearFilters,
        }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Buscar por correo"
              value={selectedKeys[0]}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={confirm}
              style={{ marginBottom: 8, display: "block" }}
            />
            <Button
              type="primary"
              onClick={confirm}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              Buscar
            </Button>
            <Button onClick={clearFilters} size="small" style={{ width: 90 }}>
              Limpiar
            </Button>
          </div>
        ),
        onFilter: (value, record) =>
          record.email.toLowerCase().includes(value.toLowerCase()),
      },
      { title: "Tipo", dataIndex: "user_type", key: "user_type" },
      {
        title: "Estado",
        dataIndex: "status_id",
        key: "status_id",
        render: (status, record) => (
          <Select
            defaultValue={status}
            onChange={(newStatus) => updateUserStatus(record.id, newStatus)}
            style={{ width: 120 }}
          >
            <Option value={1}>Activo</Option>
            <Option value={2}>Inactivo</Option>
            <Option value={3}>Suspendido</Option>
          </Select>
        ),
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
        <Button
          type="primary"
          onClick={openCreateUserModal}
          className="crearUser"
        >
          Crear Usuario
        </Button>
        <Input
          placeholder="Buscar en todos los campos"
          allowClear
          onChange={(e) => setGlobalSearchText(e.target.value.toLowerCase())}
          style={{ marginBottom: 16, width: 300, marginLeft: 25 }}
          prefix={<SearchOutlined />}
        />
        <Table
          dataSource={getFilteredUsers()}
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
          status === 1
            ? "Pendiente"
            : status === 2
            ? "Enviado"
            : status === 3
            ? "Entregado"
            : "Cancelado",
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
        <div style={{ marginBottom: "20px" }}>
          <Select
            placeholder="Filtrar por estado"
            allowClear
            onChange={handleStatusFilterChange}
            style={{ width: 200 }}
          >
            <Option value={null}>Todos</Option>
            <Option value={1}>Pendiente</Option>
            <Option value={2}>Enviado</Option>
            <Option value={3}>Entregado</Option>
            <Option value={4}>Cancelado</Option>
          </Select>
          <Button type="primary" onClick={exportFilteredOrdersToExcel}>
            Descargar Excel
          </Button>
        </div>
        <Spin spinning={loading}>
          {" "}
          {/* Muestra la rueda de carga mientras `loading` está activo */}
          <Table
            dataSource={filteredOrders}
            columns={orderColumns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Spin>
      </Card>
    );
  };

  const exportFilteredOrdersToExcel = async () => {
    const failedOrders = []; // Lista para almacenar los detalles de órdenes fallidas
    const detailedOrders = []; // Lista para almacenar los detalles exitosos

    setLoading(true); // Activamos la rueda de carga

    try {
      // Realizar todas las solicitudes en paralelo
      const responses = await Promise.all(
        filteredOrders.map(async (order) => {
          try {
            const response = await axios.get(`/api/orders/${order.id}`);
            const { order: orderDetails, items, shippingInfo } = response.data;

            // Combinar los detalles de la orden, ítems y envío en un solo objeto
            detailedOrders.push({
              "ID de Orden": orderDetails.id,
              Cliente: orderDetails.customer_name,
              "Correo Cliente": orderDetails.customer_email,
              "Fecha de Pedido": new Date(
                orderDetails.order_date
              ).toLocaleDateString(),
              Total: `$${orderDetails.total}`,
              Estado:
                orderDetails.status_id === 1
                  ? "Pendiente"
                  : orderDetails.status_id === 2
                  ? "Enviado"
                  : orderDetails.status_id === 3
                  ? "Entregado"
                  : "Cancelado",
              "Método de Envío":
                shippingInfo?.shipping_method || "No disponible",
              "Número de Rastreo":
                shippingInfo?.tracking_number || "No disponible",
              Ítems:
                items
                  .map(
                    (item) =>
                      `${item.product_name} (x${item.quantity}) - $${item.price}`
                  )
                  .join("; ") || "No disponible",
            });
          } catch (error) {
            // Captura el detalle del error para la hoja de errores
            failedOrders.push({
              "ID de Orden": order.id,
              Error: error.response
                ? error.response.data.message || "Error desconocido"
                : "No se pudo conectar con la API",
            });
          }
        })
      );

      // Crear hojas de trabajo
      const workbook = XLSX.utils.book_new();

      if (detailedOrders.length > 0) {
        const detailedWorksheet = XLSX.utils.json_to_sheet(detailedOrders);
        XLSX.utils.book_append_sheet(
          workbook,
          detailedWorksheet,
          "Pedidos Detallados"
        );
      }

      if (failedOrders.length > 0) {
        const failedWorksheet = XLSX.utils.json_to_sheet(failedOrders);
        XLSX.utils.book_append_sheet(workbook, failedWorksheet, "Errores");
      }

      // Guardar el archivo Excel
      XLSX.writeFile(workbook, "Pedidos_Detallados_y_Errores.xlsx");

      // Mensajes al usuario
      if (detailedOrders.length > 0) {
        message.success("Archivo Excel generado exitosamente.");
      }
      if (failedOrders.length > 0) {
        message.warning(
          `Algunas órdenes fallaron. Revisa la hoja de errores en el Excel.`
        );
      }
    } catch (error) {
      message.error("Error general al generar el archivo Excel.");
      console.error(error);
    } finally {
      setLoading(false); // Desactivamos la rueda de carga
    }
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
          onCancel={handleCancelUserModal} // Cambiar la función de cancelación
          footer={null}
        >
          {selectedUser && (
            <Form form={form} onFinish={updateUserDetails} layout="vertical">
              <Form.Item
                label="Nombre"
                name="user_name"
                rules={[
                  { required: true, message: "Por favor ingresa el nombre" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Apellido"
                name="lastname"
                rules={[
                  { required: true, message: "Por favor ingresa el apellido" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Por favor ingresa el correo electrónico",
                  },
                  {
                    type: "email",
                    message: "Ingresa un correo electrónico válido",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Teléfono"
                name="phone"
                rules={[
                  { required: true, message: "Por favor ingresa el teléfono" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Ciudad"
                name="city"
                rules={[
                  { required: true, message: "Por favor ingresa la ciudad" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Dirección"
                name="address"
                rules={[
                  { required: true, message: "Por favor ingresa la dirección" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Barrio"
                name="neighborhood"
                rules={[
                  { required: true, message: "Por favor ingresa el barrio" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Tipo de Usuario"
                name="user_type"
                rules={[
                  {
                    required: true,
                    message: "Por favor selecciona el tipo de usuario",
                  },
                ]}
              >
                <Select>
                  <Option value="admin">Administrador</Option>
                  <Option value="hogar">Hogar</Option>
                  <Option value="restaurante">Restaurante</Option>
                  <Option value="supermercado">Supermercado</Option>
                  <Option value="fruver">Fruver</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Estado"
                name="status_id"
                rules={[
                  { required: true, message: "Por favor selecciona el estado" },
                ]}
              >
                <Select>
                  <Option value={true}>Activo</Option>
                  <Option value={false}>Inactivo</Option>
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Guardar Cambios
                </Button>
              </Form.Item>
            </Form>
          )}
        </Modal>

        <Modal
          title="Detalles del Pedido"
          visible={isOrderModalVisible}
          onCancel={() => setIsOrderModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsOrderModalVisible(false)}>
              Cerrar
            </Button>,
          ]}
        >
          {selectedOrder && selectedOrder.order && (
            <>
              <h3>Información del Pedido</h3>
              <p>
                <strong>ID:</strong> {selectedOrder.order.id}
              </p>
              <p>
                <strong>Cliente:</strong> {selectedOrder.order.customer_name}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrder.order.customer_email}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(selectedOrder.order.order_date).toLocaleDateString()}
              </p>
              <p>
                <strong>Total:</strong> ${selectedOrder.order.total}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                {selectedOrder.order.status_id === 1
                  ? "Pendiente"
                  : selectedOrder.order.status_id === 2
                  ? "Enviado"
                  : selectedOrder.order.status_id === 3
                  ? "Entregado"
                  : "Cancelado"}
              </p>
              <Divider />

              <h3>Información de Envío</h3>
              {selectedOrder.shippingInfo ? (
                <>
                  <p>
                    <strong>Método de Envío:</strong>{" "}
                    {selectedOrder.shippingInfo.shipping_method}
                  </p>
                  <p>
                    <strong>Número de Rastreo:</strong>{" "}
                    {selectedOrder.shippingInfo.tracking_number}
                  </p>
                  <p>
                    <strong>Fecha Estimada de Entrega:</strong>{" "}
                    {new Date(
                      selectedOrder.shippingInfo.estimated_delivery
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Estado de Envío:</strong>{" "}
                    {selectedOrder.shippingInfo.shipping_status_id === 1
                      ? "En Proceso"
                      : "Entregado"}
                  </p>
                </>
              ) : (
                <p>No hay información de envío disponible.</p>
              )}
              <Divider />

              <h3>Ítems del Pedido</h3>
              {selectedOrder.items.length > 0 ? (
                <ul>
                  {selectedOrder.items.map((item, index) => (
                    <li key={index}>
                      {item.name} - {item.quantity} x ${item.price}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay ítems en este pedido.</p>
              )}
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
                  rules={[
                    { required: true, message: "Por favor ingresa el nombre" },
                  ]}
                >
                  <Input placeholder="Nombre" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Apellido"
                  name="lastname"
                  rules={[
                    {
                      required: true,
                      message: "Por favor ingresa el apellido",
                    },
                  ]}
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
                    {
                      required: true,
                      message: "Por favor ingresa el correo electrónico",
                    },
                    {
                      type: "email",
                      message: "Ingresa un correo electrónico válido",
                    },
                  ]}
                >
                  <Input placeholder="Correo Electrónico" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Teléfono"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Por favor ingresa el número de teléfono",
                    },
                  ]}
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
                  rules={[
                    {
                      required: true,
                      message: "Por favor selecciona la ciudad",
                    },
                  ]}
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
                    {
                      required: true,
                      message: "Por favor ingresa una contraseña",
                    },
                    {
                      min: 6,
                      message: "La contraseña debe tener al menos 6 caracteres",
                    },
                  ]}
                >
                  <Input.Password placeholder="Contraseña" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Tipo de Usuario"
              name="user_type"
              rules={[
                {
                  required: true,
                  message: "Por favor selecciona el tipo de usuario",
                },
              ]}
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
              <Button type="primary" htmlType="submit" loading={loading} block>
                Crear Usuario
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      <BotonWhatsapp />
      <CustomFooter />
    </div>
  );
};

export default AdminProfile;
