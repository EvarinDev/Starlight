use twilight_model::application::Application;
use twilight_model::user::CurrentUser;

fn test_types() {
    // Check what types these actually are
    let _app: Application = unimplemented!();
    let _user: CurrentUser = unimplemented!();

    // Let's see what the actual field types are
    println!("Application description type");
    println!("CurrentUser discriminator type");
}
