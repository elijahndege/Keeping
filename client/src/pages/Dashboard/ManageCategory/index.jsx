import React from 'react';
import { Table, Divider, Modal, message, Input, Upload, Icon, Button } from 'antd';
import { Link } from 'react-router-dom';
import moment from 'moment';
import WrappedForm from '../../../components/WrappedForm';
import axios from '../../../axios';


const { Column } = Table;

export default class ManageCategory extends React.Component {
  state = {
    data: [],
    visible: false,
    loading: false,
    pagination: {
      total: 0,
      pageSize: 10,
      current: 1,
    },
    editId: 0,
    filePath: null,
    confirmLoading: false,
  }

  render() {
    return (
      <div className="data-table-container">
        <div className="table-operation">
          <Button type="primary" onClick={() => this.handleEdit({ id: 0 })}>New</Button>
        </div>
        <Table
          dataSource={this.state.data}
          loading={this.state.loading}
          pagination={this.state.pagination}
          onChange={this.handleTableChange}
          rowKey="id"
        >
          <Column
            title="名称"
            dataIndex="name"
            key="name"
          />
          <Column
            title="简介"
            dataIndex="brief"
            key="brief"
          />
          <Column
            title="更新时间"
            dataIndex="updateDate"
            key="updateDate"
          />
          <Column
            title="Action"
            key="action"
            width="180px"
            render={(text, record) => (
              <span>
                <a onClick={() => this.handleEdit(record)}>
                  Edit
                </a>
                <Divider type="vertical" />
                <a onClick={() => this.handleDelete(record.id)}>Delete</a>
              </span>
            )}
          />
        </Table>
        <Modal
          title="Edit"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          forceRender
          confirmLoading={this.state.confirmLoading}
        >
          <div className="edit-form">
            <WrappedForm ref="categoryForm">
              <Input key="name" label="名称" rules={[{ required: true }]} />
              <Input.TextArea rows={4} key="brief" label="简介" />
              <Upload.Dragger
                key="cover"
                label="背景图"
                name="file"
                customRequest={this.handleUpload}
                action="/upload"
                accept="image/*"
                showUploadList={false}
                getValueFromEvent={this.normFile}
              >
                <div>
                  {
                    this.state.filePath ? <img src={this.state.filePath} alt="" /> : (
                      <div>
                        <p className="ant-upload-drag-icon">
                          <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-hint">点击或拖拽上传图片</p>
                      </div>
                    )
                  }
                </div>
              </Upload.Dragger>
            </WrappedForm>
          </div>
        </Modal>
      </div>
    );
  }

  componentDidMount = () => {
    this.handleFecthData();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { pagination: pager } = this.state;
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.handleFecthData();
  }

  handleFecthData = () => {
    const { pagination } = this.state;
    this.setState({ loading: true });
    axios.get('admin/category', {
      params: {
        pageSize: pagination.pageSize,
        pageNumber: pagination.current,
      },
    }).then((res) => {
      pagination.total = res.data.count;
      this.setState({
        data: res.data.list.map((item) => {
          item.updateDate = moment(item.updateDate).utcOffset(8).format('YYYY-M-D HH:mm');
          return item;
        }),
        pagination,
        loading: false,
      });
    });
  }

  handleDelete = (id) => {
    axios.delete(`admin/category/${id}`).then(() => {
      message.success('删除成功');
      this.handleFecthData();
    });
  }

  handleEdit = (record) => {
    this.setState({
      visible: true,
      editId: record.id,
    }, () => {
      this.refs.categoryForm.setFieldsValue({
        name: record.name,
        brief: record.brief,
        cover: record.cover,
      });
      this.setState({ filePath: record.cover });
    });
  }

  handleOk = () => {
    this.refs.categoryForm.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.setState({ confirmLoading: true });
        if (this.state.editId == 0) {
          axios.post('admin/category', values).then(() => {
            message.success('创建成功');
            this.setState({
              visible: false,
              confirmLoading: false,
            }, this.handleFecthData);
          });
        } else {
          axios.put(`admin/category/${this.state.editId}`, values).then(() => {
            message.success('修改成功');
            this.setState({
              visible: false,
              confirmLoading: false,
            }, this.handleFecthData);
          });
        }
      }
    });
  }

  handleCancel = () => {
    console.log('Clicked cancel button');
    this.setState({
      visible: false,
    });
  }

  normFile = (e) => {
    console.log('11');
    this.setState({ filePath: e.file.response ? e.file.response.path : null });
    return e.file.response && e.file.response.path;
  }

  handleUpload = ({
    action,
    data,
    file,
    filename,
    headers,
    onError,
    onProgress,
    onSuccess,
    withCredentials }) => {
    const formData = new FormData();
    if (data) {
      // eslint-disable-next-line array-callback-return
      Object.keys(data).map((key) => {
        formData.append(key, data[key]);
      });
    }
    formData.append(filename, file);
    axios
      .post(action, formData, {
        withCredentials,
        headers,
        onUploadProgress: ({ total, loaded }) => {
          onProgress({ percent: Math.round(loaded / total * 100).toFixed(2) }, file);
        },
      })
      .then(({ data: response }) => {
        onSuccess(response, file);
      })
      .catch(onError);
  }
}
