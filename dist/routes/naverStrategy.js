const passport = require('passport');
const NaverStrategy = require('passport-naver').Strategy;

const User = require('../../models/user');

module.exports = () => {
  passport.use(
    new NaverStrategy(
      {
        clientID: process.env.NAVER_ID, // 네이버에서 발급받을 ID

        clientSecret: process.env.NAVER_SECRET,

        callbackURL: '/user/login/naver/callback', // 네이버로부터 인증결과를 받을 라우터 주소
      },
      async (accessToken, refreshRoken, profile, done) => {
        // 네이버에서 인증 후 Token 과 profile을 보내준다.

        console.log('naver profile', profile);

        try {
          const exUser = await User.findOne({
            // 기존의 User가 있는지 조회
            where: { snsId: profile.id, provider: 'naver' },
          });

          if (exUser) {
            // 기존 User의 정보가 있다면 User정보를 done과 호출하고 전략을 종료

            done(null, exUser);
          } else {
            // 기존의 User정보가 없다면 회원가입을 진행

            const newUser = await User.create({
              email: profile.emails[0].value,

              nickname: profile.id,

              snsId: profile.id,

              provider: 'naver',

              naver: profile._json,
            });

            done(null, newUser); // 사용자 생성 후 done함수 호출
          }
        } catch (error) {
          console.log(error);

          done(error);
        }
      }
    )
  );
};
