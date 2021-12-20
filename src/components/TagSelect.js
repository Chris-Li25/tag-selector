import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Input, Tag, message } from 'antd';
import styles from './TagSelect.less';

const { CheckableTag } = Tag;

const msgKey = 'labelMsg';

export default class TagSelect extends PureComponent {
  static propTypes = {
    options: PropTypes.array, // 选项数组
    onBlur: PropTypes.func, // 区域失焦的回调
    onChange: PropTypes.func, //  选中标签变化的回调
    value: PropTypes.array, // 已选中的标签值
  };

  static defaultProps = {
    options: [],
    onBlur: () => {},
    onChange: () => {},
    value: [],
  };

  // 输入区域ref
  $input = React.createRef();

  // 显示区域ref
  $selectArea = React.createRef();

  // 下拉菜单ref
  $selectMenu = React.createRef();

  state = {
    _value: this.props.value,
    inputValue: '',
    selectAreaWidth: '',
    menuVisible: false,
  };

  componentDidMount() {
    this.$input.current.focus();
    const selectArea = this.$selectArea?.current;
    if (selectArea) {
      this.setState({
        selectAreaWidth: selectArea.clientWidth,
      });
    }
    document.addEventListener('mousedown', this.handleClickOutside, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside, false);
    this.setState({
      menuVisible: false,
    });
  }

  // 点击组件外部时的处理
  handleClickOutside = (e) => {
    const { onBlur } = this.props;
    const selectArea = this.$selectArea?.current;
    const selectMenu = this.$selectMenu?.current;
    const target = e?.target;
    let isInArea;
    let isInMenu;
    if (selectArea) {
      // 滚动条在父组件上
      isInArea = selectArea.parentNode.contains(target);
    }
    if (selectMenu) {
      isInMenu = selectMenu.contains(target);
    }
    if (!isInArea && !isInMenu) {
      onBlur();
      this.setState({
        menuVisible: false,
      });
    } else {
      this.setState({
        menuVisible: true,
      });
    }
  };

  // 选项选中状态变化的监听
  onTagCheckedChange = (tagValue, flag) => {
    const { onChange } = this.props;
    const { _value } = this.state;
    if (flag) {
      onChange([..._value, tagValue]);
      this.setState({
        _value: [..._value, tagValue],
      });
    } else {
      onChange(_value.filter((item) => item !== tagValue));
      this.setState({
        _value: _value.filter((item) => item !== tagValue),
      });
    }
  };

  // 输入框回车后生成新的标签 重复的标签会提示
  onInputEnter = (event) => {
    const { _value } = this.state;
    const {
      target: { value },
    } = event;
    const newTag = value.trim();
    if (newTag) {
      if (_value.includes(newTag)) {
        message.info({ content: '已存在该标签', key: msgKey });
      } else {
        this.onTagCheckedChange(newTag, true);
      }
    }
    this.setState({
      inputValue: '',
    });
  };

  // 监听输入框的后退键 没有输入内容时 删除已选标签
  onKeyDown = (event) => {
    const { inputValue, _value } = this.state;
    const { onChange } = this.props;
    if (event.keyCode === 8) {
      if (!inputValue && _value?.length > 0) {
        _value.pop();
        this.setState({
          _value: [..._value],
        });
        onChange(_value);
      }
    }
  };

  /**
   * 聚焦于输入框中
   * @param {Boolean} flag 是否滚动到视野中
   */
  focusOnInput = (flag) => {
    const input = this.$input?.current;
    if (input) {
      input.focus({
        preventScroll: flag,
      });
    }
  };

  // 渲染子项
  optionRender = () => {
    const { options } = this.props;
    const { selectAreaWidth, _value } = this.state;
    let optionsArr = [];
    optionsArr = options.map((item) =>
      item.options.map((option) => option.value),
    );
    optionsArr = optionsArr.flat();
    // 筛选出自定义的标签
    const customArr = _value.filter((item) => !optionsArr.includes(item));

    return (
      <div
        ref={this.$selectMenu}
        className={styles.selectMenu}
        style={{
          width: selectAreaWidth > 300 ? `${selectAreaWidth}px` : '300px',
        }}
      >
        {options.map((item) => (
          <div key={item.label}>
            <div>{item.label}</div>
            <div style={{ display: 'flex', flexFlow: 'row wrap' }}>
              {item.options.map((option) => {
                const checked = _value.includes(option.value);
                return (
                  <CheckableTag
                    key={option.value}
                    checked={checked}
                    onChange={(flag) =>
                      this.onTagCheckedChange(option.value, flag)
                    }
                    style={{
                      backgroundColor: checked ? '' : '#f5f5f5',
                      border: checked ? '' : '1px solid #d9d9d9',
                      margin: '5px',
                    }}
                  >
                    {option.value}
                  </CheckableTag>
                );
              })}
            </div>
          </div>
        ))}
        {/* 自定义标签的显示区域 */}
        {customArr.length > 0 && (
          <div>
            <div>自定义标签</div>
            <div style={{ display: 'flex', flexFlow: 'row wrap' }}>
              {customArr.map((item) => {
                const checked = _value.includes(item);
                return (
                  <CheckableTag
                    key={item}
                    checked={checked}
                    onChange={(flag) => this.onTagCheckedChange(item, flag)}
                    style={{
                      backgroundColor: checked ? '' : '#f5f5f5',
                      border: checked ? '' : '1px solid #d9d9d9',
                      margin: '5px',
                    }}
                  >
                    {item}
                  </CheckableTag>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  render() {
    const { className } = this.props;
    const { inputValue, menuVisible, _value } = this.state;
    return (
      <Dropdown visible={menuVisible} overlay={this.optionRender()}>
        <div
          ref={this.$selectArea}
          className={[className, styles.selectArea, styles.tagSelect]}
          onClick={() => this.focusOnInput(true)}
          onBlurCapture={() => this.focusOnInput(true)}
        >
          {_value.map((item) => (
            <Tag
              key={item}
              closable
              className={styles.tagItem}
              onClose={() => this.onTagCheckedChange(item, false)}
            >
              {item}
            </Tag>
          ))}
          <Input
            value={inputValue}
            bordered={false}
            ref={this.$input}
            className={styles.input}
            onChange={({ target: { value: newValue } }) => {
              this.setState({ inputValue: newValue });
            }}
            onKeyDown={this.onKeyDown}
            onPressEnter={this.onInputEnter}
          />
        </div>
      </Dropdown>
    );
  }
}
