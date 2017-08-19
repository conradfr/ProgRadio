# config valid only for current version of Capistrano
lock '3.9.0'

set :application, 'progradio'

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
set :deploy_to, "/var/www/#{fetch(:application)}_#{fetch(:stage)}"

# Default value for :scm is :git
# set :scm, :git

# Default value for :format is :pretty
# set :format, :pretty

# Default value for :log_level is :debug
# set :log_level, :debug

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
set :linked_files, fetch(:linked_files, []).push("app/config/parameters.yml", "app/config/app_parameters.yml")

# Default value for linked_dirs is []
set :linked_dirs, fetch(:linked_dirs, []).push('vendor', 'node_modules', 'Scraper/node_modules',"web/media/program", "web/media/thumb/program_thumb/media/program");

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
set :keep_releases, 3

# For composer task
SSHKit.config.command_map[:composer] = "php #{shared_path.join("composer.phar")}"
set :composer_install_flags, '--no-dev --no-interaction --optimize-autoloader'

# File permissions
set :file_permissions_groups, ["www-data"]
set :file_permissions_users, ["www-data", "deployer"]
set :file_permissions_chmod_mode, "0777"
set :file_permissions_paths, ["var", "web/media/program","web/media/thumb/program_thumb/media/program"]

# set :permission_method, :acl
# set :use_set_permissions, true

# npm options
# set :npm_flags, '--no-spin'
set :yarn_flags, ''

namespace :deploy do
  after :starting, 'composer:install_executable'
  before "deploy:updated", "deploy:set_permissions:acl"
  before "deploy:updated", "myproject:scraper_node"
  before "deploy:updated", "myproject:buildjs"
  before "deploy:updated", "myproject:migrations"
  before "deploy:updated", "myproject:clean"

  # after :publishing, 'progradio_importer:stop'
  # after :publishing, 'progradio_importer:start'
end

namespace :myproject do
  # scraper deps
  task :scraper_node do
    on roles(:app) do
        within release_path + "Scraper" do
            execute "yarn", "install"
            execute "chmod", "+x", "cron.sh"
        end
    end
  end

  # build app js
  task :buildjs do
    on roles(:app) do
        within release_path do
            execute "npm", "run", "build"
        end
    end
  end

  # update db fixtures
  task :migrations do
    on roles(:app) do
      within release_path do
        execute "php", "bin/console", "d:m:m", "--no-interaction"
      end
    end
  end

  # update db fixtures
  task :clean do
    on roles(:app) do
      within release_path do
        execute "rm", "-rf", "web/vue/"
        execute "rm", "-rf", "web/less/"
      end
    end
  end

end
