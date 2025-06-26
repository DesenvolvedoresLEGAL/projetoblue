CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();
CREATE TRIGGER trigger_update_profile_first_login AFTER INSERT ON auth.users FOR EACH ROW WHEN ((new.last_sign_in_at IS NOT NULL)) EXECUTE FUNCTION update_profile_last_login();
CREATE TRIGGER trigger_update_profile_last_login AFTER UPDATE OF last_sign_in_at ON auth.users FOR EACH ROW WHEN ((old.last_sign_in_at IS DISTINCT FROM new.last_sign_in_at)) EXECUTE FUNCTION update_profile_last_login();
