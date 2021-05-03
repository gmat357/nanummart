const express = require('express');
const app = express();
const path = require('path');
const nodemailer = require('nodemailer');
const email = require('./view/email').email();
const port = process.env.PORT || 3000;

app.use("/public",express.static(path.join(__dirname,"/public")));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.set('view engine','ejs');
app.set('views', path.join(__dirname,"view"));

var transporter = nodemailer.createTransport({
    service:'naver',
    auth:{
        user:email.user,
        pass:email.pass
    }
});

var mailOption = {
    from:email.from,
    to:email.to,
    subject:'',
    text:''
}

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,"/view/index.html"));
});

var name = "";
var phone = "";
var pickName = "";
var pickPhone = "";
var address = "";
var product = "";
var privacy = "";

var test = function(req,res,next){
    var body = req.body;
    phone = body.phone;
    name = (body.name + `(${phone.slice(3)})`);
    console.log(phone);
    console.log(name);
     pickName = body.pick_name;
     pickPhone = body.pick_phone;
     address = body.address;
     product = body.product;
     privacy = body.privacy;
     next();
}

app.post('/order',test,(req,res)=>{
    var addressResult = "";
    if(!privacy){
        res.send(`
            <script>
                alert("개인정보 수집 및 이용 동의해주세요.");
                history.back();
            </script>
        `)
        return;
    }
    address.forEach(i => addressResult += (i + " "));
    var titleArr = ["주문자 이름","주문자 전화번호", "수취인 이름", "수취인 전화번호", "배송지 주소", "상품들", "■ 개인정보 수집 및 이용 동의"];
    var htmlArr = [name,phone,pickName,pickPhone, addressResult, product, "개인정보 수집 및 이용에 동의합니다."];

    var html = "";
    for(var i = 0; i < titleArr.length; i++){
        html += `
        <div style="padding:3px;margin:0px 15px 0px 0px;font-size:12px; min-height:16px;">
        ${titleArr[i]}
        </div>
        <div style="padding:4px 4px 4px 10px;margin:0px 0px 5px 0px;background-color: #DDDDDD;font-size:12px;color: #888888; overflow: auto;">
            <div style="display: block">${htmlArr[i]}</div>
        </div>
        `
    }

    mailOption.subject = `주문자 : ${name} 님이 발송하신 주문서입니다.`;
    mailOption.html = `
    <table cellpadding="0" cellspacing="0" border="0" style="border:1px solid #AAAAAA;width:100%;">
        <tbody>
            <tr>
                <td style="padding:18px 11px 29px 11px;">
                    ${html}
                </td>
            </tr>
        </tbody>
    </table>
    `;

    transporter.sendMail(mailOption, (err, info)=>{
        if(err){
            console.log(`${name}님의 주문서 발송 실패 원인 ${err}`);
            res.send(`
            <script>
                alert('주문 실패했습니다.');
                history.back();
            </script>
            `);
            return;
        } 
        res.send(`
            <script>
                alert("주문서 작성이 완료되었습니다.");
                location.href="/success";
            </script>
        `)
    });


});

app.get('/success', (req,res)=>{
    var render = {
        name:name,
        phone:phone,
        pickName:pickName,
        pickPhone:pickPhone,
        address:address,
        product:product
    }
    res.render('success',render);
});

app.listen(port, ()=> console.log(`${port} server on`));