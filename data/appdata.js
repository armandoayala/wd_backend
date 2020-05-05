module.exports = {
  AppConfig: {
    db_conn: "mongodb://localhost:27017/workdesk",
    jwt_secret: "$00_work_desk_QASDFRT12587900$",
    timezone: "America/Argentina/Buenos_Aires",
    formatDate: "YYYY-MM-DD HH:mm:ss",
    NODE_ENV: "DEV",
    codeOk: "0",
    codeError: "1",
    recoveryPasswordRandomCode: true,
    minValueRandomCode: 1000,
    maxValueRandomCode: 9999,
    amountTimeExpireCode: 5,
    unitTimExpireCode: "minutes",
    logger: {
      filename: "workdesk-%DATE%.log",
      dirname: "./logs",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "5m",
      maxFiles: "5"
    },
    mail: {
      service: "gmail",
      user: "prod.arm85@gmail.com",
      password: "chespirito78912@."
    },
    admin_user: {
      create: false,
      name: "Administrator",
      surname: "Admin",
      password: "$00_admin_workdesk_00$",
      email: "admin@workdesk.com",
      role: "ROLE_ADMIN",
      image: null
    },
    urlRecoveryPassword: "http://localhost:4200/changepass"
  },
  AppRole: {
    Admin: "ROLE_ADMIN"
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
  state: {
    activo: {
      id: "1",
      name: "Activo",
      type: "GENERAL"
    },
    inactivo: {
      id: "2",
      name: "Inactivo",
      type: "GENERAL"
    }

  },
  Constant: {
    subjectRecoveryPassword: "WORKDESK - Password recovery request",
    subjectPasswordChanged: "WORKDESK - Password changed"
  },
  Cache: {
    keyTemplateRecoveryPassword: "key_0",
    keyTemplatePasswordChanged: "key_1"
  }
};
