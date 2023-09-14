import { useLoad } from '@tarojs/taro';
import Demo from '@/pages/index/demo';
import './index.css';

export default function Index() {
  useLoad(() => {
    console.log('Page loaded.');
  });

  return <Demo />;
}
