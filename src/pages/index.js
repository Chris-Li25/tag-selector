import TagSelect from '../components/TagSelect';
import styles from './index.less';

const value = ['1111', '2222', 'test1-1'];

const options = [
  {
    label: 'test1',
    options: [
      { value: 'test1-1' },
      { value: 'test1-2' },
      { value: 'test1-3' },
      { value: 'test1-4' },
    ],
  },
];

export default function IndexPage() {
  const onChange = (value) => {
    console.log(value);
  };

  return (
    <div className={styles.container}>
      <TagSelect value={value} options={options} onChange={onChange} />
    </div>
  );
}
