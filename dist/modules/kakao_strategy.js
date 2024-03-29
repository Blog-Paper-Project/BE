const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;

const User = require('../../models/user');

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_REST_API,
        callbackURL: process.env.KAKAO_REDIRECT_URI, // 카카오로부터 인증 결과를 받을 라우터 주소
      },
      // 카카오에서는 인증 수 callbakcURL 에 적힌 주소로 accessToken, refreshToken, profile 보냄
      async (accessToken, refreshToken, profile, done) => {
        console.log('kakao profile: ', profile);
        try {
          const existUser = await User.findOne({
            where: { email: profile._json.kakao_account.email },
          });
          if (
            existUser?.dataValues.email === profile._json.kakao_account.email &&
            existUser?.dataValues.provider !== 'kakao'
          ) {
            throw new Error(
              `{result : False , "${existUser?.dataValues.provider} : 이미 가입된 이메일 존재"}`
            );
          }
          if (existUser) {
            // kakao 를 통해 이미 가입된 회원이면 로그인 처리
            done(null, existUser);
          } else {
            // kakao 를 통해 처음 로그인하는 회원이면 회원가입 처리 및 로그인 처리
            const newUser = await User.create({
              email: profile._json.kakao_account.email,
              nickname: 'K' + (profile._json && profile._json.properties.nickname),
              provider: 'kakao',
            });
            done(null, newUser);
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  );
};
