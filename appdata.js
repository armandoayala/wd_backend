module.exports = {
  AppConfig: {
    db_conn: process.env.MONGODB_URI,
    jwt_secret: process.env.JWT_SECRET,
    jwt_minutes_expire: process.env.JWT_MINUTES_EXPIRE,
    jwt_token_prefix: "Bearer ",
    timezone: process.env.TIME_ZONE,
    formatDate: process.env.FORMAT_DATE,
    NODE_ENV: process.env.NODE_ENV || "DEV",
    codeOk: "0",
    codeError: "1",
    recoveryPasswordRandomCode: process.env.RECOVER_PASS_RANDOM_CODE,
    sendEmailConfirmUser: process.env.SEND_EMAIL_CONFIRM_USER,
    minValueRandomCode: 1000,
    maxValueRandomCode: 9999,
    amountTimeExpireCode: 5,
    unitTimExpireCode: "minutes",
    APP_NAME: "WORKDESK",
    logger: {
      filename: "workdesk-%DATE%.log",
      dirname: process.env.LOGGER_DIR,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "5m",
      maxFiles: "5"
    },
    mail: {
      SENDGRID_EMAIL_USER: process.env.SENDGRID_EMAIL_USER,
      SENDGRID_API_KEY: process.env.SENDGRID_API_KEY
    },
    admin_user: {
      create: process.env.ADMIN_CREATE,
      name: "Administrator",
      surname: "Admin",
      password: process.env.ADMIN_PASSWORD,
      email: process.env.ADMIN_EMAIL,
      role: process.env.ADMIN_ROLE,
      image: null
    },
    urlRecoveryPassword: process.env.URL_RECOVER_PASSWORD,
    urlWelcomeUser: process.env.URL_WELCOME_USER,
    limitDefaultFindPerPage: process.env.LIMIT_DEFAULT_FIND_PERPAGE,
    encode_iterations: process.env.ENCODE_ITERATIONS,
  },
  AppRole: {
    Admin: process.env.ADMIN_ROLE
  },
  AppUserEvent: {
    recoveryPassword: "RECOVERY_PASSWORD"
  },
  HttpStatus: {
    success: 200,
    bad_request: 400,
    forbidden: 403,
    not_found: 404,
    internal_error_server: 500
  },
  locale: {
    argentina: {
      lang: "es",
      region: "es-AR",
      pais: "Argentina"
    },
    eeuu: {
      lang: "en",
      region: "en-US",
      pais: "EEUU"
    }
  },
  Status: {
    activo: {
      id: "1",
      code:"ACTIVE",
      name: "Activo",
      type: "GENERAL"
    },
    inactivo: {
      id: "2",
      code:"INACTIVE",
      name: "Inactivo",
      type: "GENERAL"
    },
    eliminado: {
      id: "3",
      code:"DELETED",
      name: "Eliminado",
      type: "GENERAL"
    },
    pendiente_confirm: {
      id: "4",
      code:"PENDING_CONFIRMATION",
      name: "Pendiente confirmacion",
      type: "GENERAL"
    }

  },
  Constant: {
    subjectRecoveryPassword: "WORKDESK - Password recovery request",
    subjectPasswordChanged: "WORKDESK - Password changed",
    subjectWelcomeUser: "WORKDESK - Welcome - Confirmation email"
  },
  Cache: {
    keyTemplateRecoveryPassword: "key_0",
    keyTemplatePasswordChanged: "key_1",
    keyTemplateWelcomeUser: "key_2"
  }
};
