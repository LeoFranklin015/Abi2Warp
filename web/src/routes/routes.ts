import { RouteNamesEnum } from 'localConstants';
import { Home } from 'pages';
import { ABI2Warp } from 'pages/abi2warp';
import YourWarps from 'pages/yourWarps/YourWarps';
import { RouteType } from 'types';

interface RouteWithTitleType extends RouteType {
  title: string;
}

export const routes: RouteWithTitleType[] = [
  {
    path: RouteNamesEnum.home,
    title: 'Home',
    component: Home
  },
  {
    path: RouteNamesEnum.abi2warp,
    title: 'ABI to Warp',
    component: ABI2Warp
  },
  {
    path: RouteNamesEnum.yourWarps,
    title: 'Your Warps',
    component: YourWarps
  }
];
