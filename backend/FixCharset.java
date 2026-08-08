import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

/**
 * 一次性脚本：把 notes 表和 learning_assistant 库的字符集统一到 utf8mb4_unicode_ci。
 *
 * 注意：DB 连接信息已全部改为从环境变量读取，
 * 避免把数据库账号/密码硬编码到仓库里。
 *
 * 用法：
 *   DB_URL='jdbc:mysql://localhost:3306/learning_assistant?...' \
 *   DB_USERNAME='root' \
 *   DB_PASSWORD='你的密码' \
 *   javac FixCharset.java && java FixCharset
 */
public class FixCharset {
    public static void main(String[] args) {
        String url = System.getenv("DB_URL");
        String user = System.getenv("DB_USERNAME");
        String password = System.getenv("DB_PASSWORD");

        if (url == null || url.isEmpty()
                || user == null || user.isEmpty()
                || password == null || password.isEmpty()) {
            System.err.println("缺少环境变量：DB_URL / DB_USERNAME / DB_PASSWORD 都要提供");
            System.err.println("示例（bash）：");
            System.err.println("  export DB_URL='jdbc:mysql://localhost:3306/learning_assistant?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai'");
            System.err.println("  export DB_USERNAME='root'");
            System.err.println("  export DB_PASSWORD='你的密码'");
            System.exit(1);
        }

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {

            // 修改notes表的字符集
            stmt.execute("ALTER TABLE notes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            System.out.println("notes表字符集修改成功");

            // 修改数据库默认字符集
            stmt.execute("ALTER DATABASE learning_assistant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            System.out.println("数据库字符集修改成功");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}