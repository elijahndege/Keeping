import React from 'react';
import { Table, Divider, Tag, Modal, message } from 'antd';
import { Link } from 'react-router-dom';
import axios from '../../../axios';

const { Column } = Table;

export default class PostList extends React.Component {
  state = {
    data: [],
    ModalText: 'Content of the modal',
    visible: false,
    confirmLoading: false,
    loading: false,
    pagination: {
      total: 0,
      pageSize: 10,
      current: 1,
    },
  }

  render() {
    return (
      <div className="data-table-container">
        <Table
          dataSource={this.state.data}
          loading={this.state.loading}
          pagination={this.state.pagination}
          onChange={this.handleTableChange}
          rowKey="id"
        >
          <Column
            title="文章标题"
            dataIndex="title"
            key="title"
          />
          <Column
            title="状态"
            dataIndex="status"
            key="status"
          />
          <Column
            title="更新时间"
            dataIndex="updateDate"
            key="updateDate"
          />
          <Column
            title="类别"
            dataIndex="categories"
            key="categories"
            render={categories => (
              <span>
                {categories.map(category => <Tag color="blue" key={category}>{category}</Tag>)}
              </span>
            )}
          />
          <Column
            title="Action"
            key="action"
            render={(text, record) => (
              <span>
                <Link to={`/dashboard/post/edit/${record.id}`}>
                  Edit
                </Link>
                <Divider type="vertical" />
                <a onClick={() => this.handleDelete(record.id)}>Delete</a>
              </span>
            )}
          />
        </Table>
        <Modal
          title="Title"
          visible={this.state.visible}
          onOk={this.handleOk}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.handleCancel}
        >
          <p>{this.state.ModalText}</p>
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
    axios.get('admin/post', {
      params: {
        pageSize: pagination.pageSize,
        pageNumber: pagination.current,
      },
    }).then((res) => {
      pagination.total = res.data.count;
      this.setState({
        data: res.data.list,
        pagination,
        loading: false,
      });
    });
  }

  handleDelete = (id) => {
    axios.delete(`admin/post/${id}`).then(() => {
      this.handleFecthData();
      message.success('删除成功');
    });
  }


  showModal = () => {
    this.setState({
      visible: true,
    });
  }


  handleCancel = () => {
    console.log('Clicked cancel button');
    this.setState({
      visible: false,
    });
  }
}
