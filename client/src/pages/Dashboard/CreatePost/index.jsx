import React from 'react';
import {
  Form, Icon, Input, Button, Checkbox, Upload, message,
} from 'antd';
import { withRouter } from 'react-router-dom';

import WrappedForm from '../../../components/WrappedForm';
import MarkdownEditor from '../../../components/MarkdownEditor';
import axios from '../../../axios';

class CreatePost extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.refs.postForm.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        axios.post('admin/post', values).then(() => {
          message.success('创建成功');
          this.props.history.push('/dashboard/post/list');
        });
      }
    });
  }

  render() {
    return (
      <div className="create-post-container">
        <WrappedForm ref="postForm">
          <Input key="title" label="标题" rules={[{ required: true }]} />
          <Input.TextArea rows={4} key="brief" label="简介" />
          <Upload.Dragger key="cover" label="背景图" name="files" action="/upload.do">
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-hint">点击或拖拽上传图片</p>
          </Upload.Dragger>
          <MarkdownEditor key="content" label="内容" rules={[{ required: true }]} />
          <Button key="submit" type="primary" className="login-form-button" onClick={this.handleSubmit}>
            完成
          </Button>
        </WrappedForm>
      </div>
    );
  }
}

export default withRouter(CreatePost);
