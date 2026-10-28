import React from 'react';
import { installPwa, canInstallPwa } from './pwa';
export function PwaInstallBanner() {
 const [available,setAvailable]=React.useState(false);
 const [dismissed,setDismissed]=React.useState(false);
 React.useEffect(()=>{const refresh=()=>setAvailable(canInstallPwa());document.addEventListener('nanghoa-install-ready',refresh);document.addEventListener('nanghoa-installed',refresh);refresh();return()=>{document.removeEventListener('nanghoa-install-ready',refresh);document.removeEventListener('nanghoa-installed',refresh)}},[]);
 if(!available||dismissed)return null;
 return <aside className="nanghoa-install"><span>🌷 Cài Nàng Hoa POS lên thiết bị để mở như ứng dụng.</span><button onClick={()=>installPwa().then(()=>setAvailable(canInstallPwa()))}>Cài ứng dụng</button><button aria-label="Đóng" onClick={()=>setDismissed(true)}>×</button></aside>;
}
