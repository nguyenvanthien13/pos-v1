import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Controller('api/order-email')
export class OrderEmailController {
  @Post()
  async send(@Body() body: any) {
    const {order,store}=body||{};
    if (!order || typeof order.email!=='string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.email) || !Array.isArray(order.items)) throw new HttpException('Dữ liệu email không hợp lệ',400);
    const {SMTP_HOST,SMTP_PORT,SMTP_USER,SMTP_PASS,SMTP_FROM}=process.env;
    if (!SMTP_HOST||!SMTP_USER||!SMTP_PASS||!SMTP_FROM) throw new HttpException('Chưa cấu hình SMTP',503);
    const transporter=nodemailer.createTransport({host:SMTP_HOST,port:Number(SMTP_PORT||587),secure:Number(SMTP_PORT||587)===465,auth:{user:SMTP_USER,pass:SMTP_PASS}});
    const safe=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
    const vnd=(n:unknown)=>Number(n||0).toLocaleString('vi-VN')+' đ';
    const lines=order.items.slice(0,100).map((i:any)=>`<tr><td style="padding:8px;border-bottom:1px solid #eee">${safe(i.name)} × ${Number(i.qty)||0}</td><td style="padding:8px;text-align:right;border-bottom:1px solid #eee">${vnd(Number(i.price)*Number(i.qty))}</td></tr>`).join('');
    const html=`<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#503a2b"><h1 style="color:#795039">${safe(store?.name||'Nàng Hoa')}</h1><p>Xin chào ${safe(order.customer)}, cảm ơn bạn đã đặt hoa!</p><h2>Xác nhận đơn ${safe(order.id)}</h2><table style="width:100%;border-collapse:collapse">${lines}</table><p><b>Tổng tiền:</b> ${vnd(order.total)}<br/><b>Đã thanh toán:</b> ${vnd(order.paid)}<br/><b>Còn lại:</b> ${vnd(Math.max(0,Number(order.total)-Number(order.paid)))}</p><p><b>Ngày giao:</b> ${safe(order.deliveryAt||'Nhận tại cửa hàng')}<br/><b>Địa chỉ giao:</b> ${safe(order.address||'Nhận tại cửa hàng')}<br/><b>Ghi chú:</b> ${safe(order.note||'Không có')}</p><hr/><p>${safe(store?.address||'')} · ${safe(store?.phone||'')}</p></div>`;
    try {await transporter.sendMail({from:SMTP_FROM,to:order.email,subject:`Xác nhận đơn hoa ${String(order.id).replace(/[\r\n]/g,'')}`,html});return {sent:true};}
    catch {throw new HttpException('Không gửi được email; kiểm tra cấu hình SMTP',HttpStatus.BAD_GATEWAY);}
  }
}
