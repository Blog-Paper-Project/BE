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

<img src="https://user-images.githubusercontent.com/98739079/182773287-a1ef2b4e-84cb-4b11-8c9c-1a3d51f5ded4.png" width="600"/>

<br/>

## 🐜 ERD

<img src="https://user-images.githubusercontent.com/105111888/182780028-11c16add-1471-4d1e-976c-65f1e9edbacf.png" width="600"/>

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
![JWT](https://img.shields.io/badge/JSONWebTokens-000000?style=for-the-badge&logo=JSONWebTokens&logoColor=white)
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
- 게시글(+이미지), 댓글 조회, 작성, 수정, 삭제
- 검색하기
- 좋아요, 구독
- 카테고리, 태그
3. 예약하기
- 예약 신청 및 취소
4. 화상 통화 및 채팅
- 방 입장을 통한 블로거와 1대1 대화

<br/>

## 📖 라이브러리

| Name                | Appliance               | Version  |
| :-----------------: | :---------------------: | :------: |
| sequelize           | MYSQL ORM               |6.21.1|
| redis               | 인메모리 DB               |4.2.0|
| mysql2              | 관계형 DB                 |2.3.3|
| bcrypt              | 비밀번호 암호화             |5.0.1|
| jsonwebtoken        | JWT 토큰 발급             |8.5.1|
| passport            | 소셜 로그인                |0.6.0|
| passport-kakao      | 카카오 소셜 로그인           |1.0.1|
| nodemailer          | 이메일 인증                |6.7.5|
| multer              | 파일 업로드               |1.4.5-lts.1|
| multer-s3-transform | AWS S3 파일 업로드        |2.10.3|
| sharp               | 이미지 편집                |0.30.7|
| dayjs               | 날짜, 시간 관리              |1.11.3|
| joi                 | 유효성 검사                 |17.6.0|
| node-cron	          | 스케쥴러                  |3.0.1|
| eslint              | 코드 분석                 |8.19.0|
| dotenv              | 환경변수 설정              |16.0.1|
| cors                | CORS 핸들링              |2.8.5|
| helmet              | HTTP header 보안         |5.1.0|
| morgan              | 개발 로그 관리             |1.10.0|
| winston             | 서버 로그 관리             |3.8.0|
| socket.io	          | 실시간 화상 통화 및 채팅     |4.5.1|
| artillery	          | 스트레스 테스트             |2.0.0-20|
| jest                | 코드 테스트              |28.1.2|
| supertest           | 코드 테스트               |6.2.3|

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

<details>
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

<img src="https://user-images.githubusercontent.com/98739079/182777495-d018f9b5-0bcb-4428-9a0c-9492915dd495.png" width="200"/>
<img src="https://user-images.githubusercontent.com/98739079/182777501-7f81f386-33aa-42e0-9c5d-35a4884a9c5c.png" width="200"/>
 
Artillery로 테스트해본 결과, 기존 방식에 비해 레디스를 같이 활용했을 때 응답 속도가 70% 가량 단축되었다.
  
**`아쉬운점`**

10분마다 인기 게시글을 업데이트 해주기 때문에 실시간으로 업데이트된 데이터를 제공할 수 없다는 한계점이 있다.

**`응용`**

1. 일일 조회수를 레디스에 저장하고 오전 12시에 합산하여 DB에 업데이트한다. 레디스의 데이터 타입 set을 활용하여 중복 집계를 방지한다.
2. 레디스를 세션 저장소로 활용하여 JWT 토큰을 저장하고 중복 로그인을 방지한다.
  
</details>

<details>
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
  
</details>

<details>
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

</details>

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
