# config valid only for current version of Capistrano
lock '3.9.0'

set :application, 'progradio'

set :repo_url, 'git@bitbucket.org:yoyolebatteur/progradio.git'

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
set :linked_dirs, fetch(:linked_dirs, []).push('vendor', 'node_modules', 'Scraper/node_modules');

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for keep_releases is 5
set :keep_releases, 3

# For composer task
SSHKit.config.command_map[:composer] = "php #{shared_path.join("composer.phar")}"
set :composer_install_flags, '--no-dev --no-interaction --optimize-autoloader'

# File permissions
set :file_permissions_groups, ["www-data"]
set :file_permissions_users, ["www-data"]
set :file_permissions_chmod_mode, "0774"

set :permission_method, :acl
set :use_set_permissions, true

# npm options
set :npm_flags, '--silent --no-spin'

namespace :deploy do
  after :starting, 'composer:install_executable'
  before "deploy:updated", "deploy:set_permissions:acl"
  before "deploy:updated", "myproject:scraper_node"
  before "deploy:updated", "myproject:migrations"
end

namespace :myproject do
  # update db fixtures
  task :scraper_node do
    on roles(:app) do
        within release_path + "Scraper" do
            execute "npm", "install"
        end
    end
  end

  # update db fixtures
  task :migrations do
    on roles(:app) do
      within release_path do
        execute "php", "bin/console", "d:m:m", "--no-interaction"
        execute "php", "bin/console", "doctrine:fixtures:load", "--append"
      end
    end
  end

end
