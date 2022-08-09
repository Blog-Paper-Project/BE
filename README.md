<img src="https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F48a2bf33-bbb6-4e1c-ba45-9f04e920d53a%2FPAPER.jpeg?table=block&id=a934e6cc-b99a-4024-a857-1cff6619333b&spaceId=45af053f-84a5-4fa9-b5c7-de7e57b65827&width=2000&userId=e4ec6b27-fdb8-48dd-9fe0-06b3dd4d8123&cache=v2"/>

# [Paper](https://www.paper-daily.com/) 

화상으로 소통하는 블로그 플랫폼

자신의 생각을 글로 적어보아요.

공감 가는 글을 읽고 블로거 주인과 소통하고 싶나요?

나의 생각을 공유해 나뭇잎을 모으고 댓글뿐만 아니라 화상채팅으로 소통할 수 있습니다.

자신만의 이야기로 소통할 수 있는 블로그 **PAPER**

<br/>

## 📆 프로젝트 기간

- 2022.06.24 - 2022.08.06

<br/>

## 🧱 아키택처

<img src="https://user-images.githubusercontent.com/98739079/182773287-a1ef2b4e-84cb-4b11-8c9c-1a3d51f5ded4.png" width="650"/>

- 백엔드 웹 어플리케이션 서버는 Node.js와 Express로 구축

- Nginx에 SSL인증을 도입해 WebRTC 실시간 화상 통화 구현 및 리버스 프록시 설정을 통해 백엔드 서버에 직접적인 접근을 차단하여 보안 강화

- 깃허브 액션 CI-CD를 통해 Docker Image를 빌드하여 동일한 개발 환경으로 자동화 배포

- 기본 데이터베이스는 데이터의 무결성을 보장하기 위해 RDS의 Mysql와 ORM인 Sequelize 사용

- 인메모리 데이터 구조 저장소인 Redis에는 I/O이 빈번하거나 일회성인 데이터를 저장하여 데이터 처리 속도를 크게 개선

- 이미지 데이터는 Multer 미들웨어를 통해 Multipart/form-data로 받아오고 S3 버킷에 저장, 삭제할 수 있도록 구현

- 사용자의 간편한 로그인을 위해 passport를 이용해 카카오 로그인 구현

<br/>

## 🐜 ERD

<img src="https://user-images.githubusercontent.com/105111888/182780028-11c16add-1471-4d1e-976c-65f1e9edbacf.png" width="650"/>

<br/>

## 🛠 기술 스택

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=white)
<br>
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=Jest&logoColor=white)
![Eslint](https://img.shields.io/badge/Eslint-4B32C3?style=for-the-badge&logo=Eslint&logoColor=white)
![Passport](https://img.shields.io/badge/Passport-34E27A?style=for-the-badge&logo=Passport&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=WebRTC&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=Socket.io&logoColor=white)
<br>
![Mysql](https://img.shields.io/badge/MYSQL-4479A1?style=for-the-badge&logo=MYSQL&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![S3](https://img.shields.io/badge/AmazonS3-569A31.svg?style=for-the-badge&logo=AmazonS3&logoColor=white)
<br>
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg?style=for-the-badge&logo=Docker&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639.svg?style=for-the-badge&logo=Nginx&logoColor=white)
<br>

<br/>

## 🕹️ 주요 기능

1. 로그인/회원가입
- 카카오 소셜 로그인
- 비밀번호 변경
2. 블로그
- 게시글(+이미지), 댓글을 조회, 작성, 수정, 삭제
- 1주일간 좋아요를 많이 받은 인기 게시글과 유저 추천
- 좋아요, 구독
- 키워드로 게시글 검색
- 카테고리, 태그별로 게시글 조회
3. 예약하기
- 예약 신청 및 취소
4. 화상 통화 및 채팅
- 방 입장을 통한 블로거와 1대1 대화

<br/>

## 📖 라이브러리

| 이름                 | 설명                     | 버전  |
| :-----------------: | :--------------------- | :------: |
| sequelize           | 객체지향적인 코드로 인해 직관적이고 로직에 더 집중할 수 있고 테이블 간 관계설정을 SQL에 비해 쉽게 할 수 있다는 장점때문에 대표적인 ORM인 Sequelize를 선택 |6.21.1|
| redis               | 클라이언트에서 동일한 요청이 계속 올때 서버에서 직접 데이터를 찾으면 상당히 비효율적이고 데이터의 크기에 따라 응답속도가 느려짐. 이때 요청결과를 미리 저장해 두었다가, 동일한 데이터 요청이 오면 바로 전달할 수 있도록 redis를 사용 |4.2.0|
| bcrypt              | 해시 함수들은 무결성 검사를 위해 빠른 속도가 필요하지만, 해커가 DB를 탈취 했을때 빠른 속도로 비밀번호를 알아낼 수 있음. 패스워드 저장에서의 해시 함수의 문제점을 보완해서 나온것이 pbkfd2. 8글자 부터는 동일 시스템에서 bcrypt가 pbkfd2보다 4배 이상의 시간을 소모해야 비밀번호를 알아낼 수 있기 때문에 보안성을 위해 사용  |5.0.1|
| passport-kakao      | passport는 express 프레임워크 상에서 사용되는 인증 미들웨어 라이브러리. strategies로 알려져 있는 인증 메커니즘을 각 모듈로 패키지화해서 제공. 즉, 앱은 passport에서 지원하는 전략을 선택해 의존성 없이 독립적으로 이용 가능함           |1.0.1|
| nodemailer          | 이메일 인증을 위해서 이메일 전송에 필요한 네트워크 프로토콜인 SMTP(우편 전송 프로토콜)을 사용해야 함. Node.js SMTP기반으로 개발된 전용 모듈인 nodemailer는 사용법이 매우 간단하여 사용하게 됨 |6.7.5|
| multer              | Multipart/form-data를 처리하는 미들웨어로 서로 다른 Content-type인 이미지 파일과 텍스트를 같이 전송하기 위해 사용. aws-sdk, sharp와 깉이 사용하기 쉽게 구현되어 있음 |1.4.5-lts.1|
| dayjs               | javascript의 날짜 관련 라이브러리 중에서 가장 가벼움. Date 객체는 작성해야 하는 코드도 많고 출력 포맷을 변경하려면 직접 함수를 만들어야 하기 때문에 가독성이 떨어짐 |1.11.3|
| joi                 | 로그인, 회원가입, 게시글 등 유효성 검사를 위해 joi를 사용, 스키마를 활용해 가독성이 좋고 모듈로서 활용도 좋아 Joi를 선택 |17.6.0|
| node-cron	          | 항상 실행되어 있는 App에서 일정 시간마다 특정 함수를 사용하기 위해 node-cron을 활용. node-schedule보다 적은 메모리를 사용 |3.0.1|
| eslint              | 코드를 분석해 문법적인 오류를 찾아주거나 프로젝트 내에서 일관된 코드 스타일을 유지하기 위해 사용. 프로젝트에는 Airbnb의 코딩 컨벤션을 적용. |8.19.0|
| socket.io	          | 블로거와 1대1 실시간 채팅 및 WebRTC signaling server로 활용하기 위해 Socket.io를 사용. 브라우저 환경에 맞게 가장 적합한 통신 방식을 알아서 선택하고 WebSocket이 기본적으로 제공하지 않는 namespace, room 기능, 다양한 데이터 전송 가능 등을 제공하기 때문에 Socket.io를 선택 |4.5.1|
| artillery	          | 코드의 변화에 따른 성능을 비교하기 위해 사용. 테스트 시나리오를 작성하고 테스트 결과를 파일로 저장할 수 있음          |2.0.0-20|
| jest                | 배포 전 작성한 코드가 예상한 대로 실행하는지 체크하고 코드 품질 향상 및 코드 문서화를 위해 테스트 코드를 작성. 여러 테스트 프레임워크 중 Jest는 코드 작성이 심플하고 테스트를 병렬로 실행해 테스트 실행 속도가 빠르다는 장점이 있어 선택 |28.1.2|

<br/>

## ✍ 커밋 메세지 규칙

- feat : 새로운 기능 추가
- fix : 빌드 관련 파일 수정
- build : 빌드 관련 파일 수정
- chore : 그 외 자잘한 수정
- ci : CI 관련 설정 수정
- docs : 문서 수정
- style : 코드 스타일 혹은 포맷 수정
- refactor : 코드 리팩토링
- test : 테스트 코드 수정

<br/>

## 🔥 트러블 슈팅

<summary><b> ✔️ 메인페이지 로딩 속도 개선</b></summary>
<br>

**`문제점`**

1. 메인 페이지는 서비스를 이용하는 모든 유저들이 방문하기 때문에 API 사용량이 매우 많다.
2. DB에서 모든 게시글을 조회하고 1주일간 좋아요를 많이 받은 순서로 정렬하는 로직을 매번 실행한다.
3. 느린 로딩 속도로 유저가 느끼는 불편함을 개선하고 운영 측면에서도 서버 비용을 감축할 필요가 있다.

**`해결방안`**

1. 레디스에 가공된 데이터를 미리 저장하고 API 호출 시 DB에 접근하지 않고 레디스에서 바로 해당 데이터를 전송한다.
2. 10분 단위로 캐시에 저장된 데이터를 업데이트한다.

**`결과`**

<div>
<img src="https://user-images.githubusercontent.com/98739079/182777495-d018f9b5-0bcb-4428-9a0c-9492915dd495.png" width="200"/>
<img src="https://user-images.githubusercontent.com/98739079/182777501-7f81f386-33aa-42e0-9c5d-35a4884a9c5c.png" width="200"/>
</div>
 
Artillery로 테스트해본 결과, 기존 방식에 비해 레디스를 같이 활용했을 때 서버 응답 속도가 70% 가량 단축되었다.
  
**`아쉬운점`**

10분마다 인기 게시글을 업데이트 해주기 때문에 실시간으로 업데이트된 데이터를 제공할 수 없다는 한계점이 있다.

**`응용`**

1. 일일 조회수를 레디스에 저장하고 오전 12시에 합산하여 DB에 업데이트한다. 레디스의 데이터 타입 set을 활용하여 중복 집계를 방지한다.
2. 레디스를 세션 저장소로 활용하여 JWT 토큰을 저장하고 중복 로그인을 방지한다.
  
<br>  
  
<summary><b> ✔️ 상세페이지 로딩 속도 개선 </b></summary>
<br>

**`문제점`**

1. 1:N의 관계를 갖는 데이터(게시글 : 댓글, 좋아요, 태그 등) 조회에 Eager Loading을 활용한다.
2. 여러 번의 테이블 Join으로 성능 저하된다.

**`해결방안`**

1. Lazy Loading을 활용하여 데이터를 각각 테이블에서 조회한다.

**`결과`**

1. 코드 가독성이 좋아졌다.
```Javascript
// Eager Loading
const paper = await Paper.findOne({
    where: { postId },
    include: [
        {
            model: Comment,
            include: {
                model: User,
                as: 'Users',
                attributes: ['userId', 'blogId', 'nickname', 'profileImage'],
            },
        },
        { model: Tag, attributes: ['name'] },
        { model: User, as: 'Users', attributes: ['blogId', 'nickname', 'profileImage'] },
        { model: User, as: 'Likes', attributes: ['blogId'] },
    ],
});
```
```Javascript
// Lazy Loading
const paper = await Paper.findOne({ where: { postId } })
const comments = await Comment.findAll({
    where: { postId },
    include: {
        model: User,
        as: 'Users',
        attributes: ['userId', 'blogId', 'nickname', 'profileImage'],
    },
});
const tags = await paper.getTags({ attributes: ['name'] });
const user = await paper.getUsers({ attributes: ['blogId', 'nickname', 'profileImage'] });
const likes = await paper.getLikes({ attributes: ['blogId'] });
```

2. 기존 방식에 비해 서버 응답 속도가 50% 가량 단축되었다.

<div>
<img src="https://user-images.githubusercontent.com/98739079/183558639-f4ce605d-2afd-45ca-b848-c6627a9381a8.png" width="200"/>
<img src="https://user-images.githubusercontent.com/98739079/183558649-217b62e1-7252-4573-b4bd-20f880931d91.png" width="200"/>
</div>
  
<br>  
  
<summary><b> ✔️ 도커 도입</b></summary>
<br>

**`문제점`**

로컬에서 문제없이 돌아가던 서버가 배포 후 실행을 하면 reify fsevents 프리징 문제 발생

구글링을 통해 노드 버전 문제로 인한 에러라는 사실 발견

**`해결방안`**

1. 노드 버전을 로컬환경과 맞춰주는 방법도 있지만 추가 인스턴스를 생성할 때마다 맞춰줘야하는 번거로움 발생
2. 로컬환경의 도커 이미지를 생성해 인스턴스에서 실행

**`결과`**

로컬에 작업한 걸 이미지로 빌드해 실행하니 배포환경에서 버전 이슈 등으로 인한 에러를 걱정하지 않고 배포 가능
  
<br>
  
<summary><b> ✔️ S3 미사용 이미지 관리 문제</b></summary>
<br>

**`문제점`**

이미지를 첨부(업로드)하고 게시글을 작성하다가 중간에 페이지를 벗어난다면 사용되지 않는 이미지가 S3에 남아있게 됨
게시글을 수정하면서 기존에 사용한 이미지를 삭제할 때도 똑같은 문제가 생김

**`해결방안`**

1. image 테이블을 추가
2. 이미지 업로드 시 image 테이블에 postId가 null인 상태로 추가
3. 게시글 동록 시 본문에 정규식으로 이미지 url들을 필터링하고 배열에 저장 배열 내 값들과 일치하는 row들은 postId를 부여
4. node-cron으로 postId가 null이고 updateAt이 하루 전 이상인 데이터를 주기적으로 삭제

<br/>

## 🧑‍💻 팀 구성
<table>
   <tr>
     <td colspan='4' align="center">
       <b>Backend</b>
     </td>
   </tr>
   <tr>
    <td align="center"><b><a href="https://github.com/KwangMin-Moon">문광민</a></b></td>
    <td align="center"><b><a href="https://github.com/mj-song00">송민지</a></b></td>
    <td align="center"><b><a href="https://github.com/sounwoo">박선우</a></b></td>
    <td align="center"><b><a href="https://github.com/alltimeno1">김성준</a></b></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/KwangMin-Moon"><img src="https://avatars.githubusercontent.com/u/97036088?v=4" width="80px" /></a>
    <td align="center"><a href="https://github.com/mj-song00"><img src="https://avatars.githubusercontent.com/u/104669297?v=4" width="80px" /></a></td>
    <td align="center"><a href="https://github.com/sounwoo"><img src="https://avatars.githubusercontent.com/u/105111888?v=4" width="80px" /></a></td>
    <td align="center"><a href="https://github.com/alltimeno1"><img src="https://avatars.githubusercontent.com/u/98739079?v=4" width="80px" /></a></td>
  </tr>
</table>

<table>
   <tr>
     <td colspan='3' align="center">
       <b>Frontend</b>
     </td>
   </tr>
   <tr>
    <td align="center"><b><a href="https://github.com/ted-jv">구자덕</a></b></td>
    <td align="center"><b><a href="https://github.com/unchul">임운철</a></b></td>
    <td align="center"><b><a href="https://github.com/daegyu-jeong">정대규</a></b></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/ted-jv"><img src="https://avatars.githubusercontent.com/u/105185055?v=4" width="80px" /></a></td>
    <td align="center"><a href="https://github.com/unchul"><img src="https://avatars.githubusercontent.com/u/105141025?v=4" width="80px" /></a></td>
    <td align="center"><a href="https://github.com/daegyu-jeong"><img src="https://avatars.githubusercontent.com/u/105157997?v=4" width="80px" /></a>
  </tr>
</table>
