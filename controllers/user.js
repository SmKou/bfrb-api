const user = (knex, decoded) => {
    return  knex('login_tb')
            .select('*')
            .rightOuterJoin('users_tb', 'login_tb.id', 'users_tb.id')
            .where({ code: decoded })
}

module.exports = { user }