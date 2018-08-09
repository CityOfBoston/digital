require "rubygems"
require "bundler"

Bundler.require(:default)

ALLOWED_SITES = [
  'cob-header.herokuapp.com',
  'youthjobs.mapc.org',
  'careercenter-boston.icims.com',
  'earlyvoting.boston.gov',
  'cpainfo.boston.gov',
  'cityofboston.gov',
  'www.cityofboston.gov',
  'municipaldesign.club',
  'roadmap.boston.gov',
  '0.0.0.0',
  '0.0.0.0:9000',
  'localhost',
  'bfd-bostontest.icims.com',
  'city-bostontest.icims.com',
  'bps-bostontest.icims.com',
  'city-bostontest.icims.com',
  'civil-bostontest.icims.com',
  'coit-bostontest.icims.com',
  'employeeconnect-bostontest.icims.com',
  'internships-bostontest.icims.com',
  'onboardfirefighter-bostontest.icims.com',
  'onboarding-bostontest.icims.com',
  'onboardpolice-bostontest.icims.com',
  'oboardsuccesslink-bostontest.icims.com',
  'successlink-bostontest.icims.com',
  'cob-oemalerts.herokuapp.com',
  'emergency-alerts.boston.gov',
  'climatechangedata.boston.gov',
  'officialheader.boston.gov',
  'official-header.digital-staging.boston.gov',
  'www.sparkbos.com',
  'sparkbos.com',
]

class Header
  def call(env)
    request = Rack::Request.new(env)

    case env['PATH_INFO']
    when "/"
      [200, {"Content-Type" => "text/html"}, [File.read(File.join('dist', 'test.html'))]]
    when "/header.js"
      return_file('header.js', request)
    when "/update.js"
      return_file('emergency.js', request)
    else
      [404, {"Content-Type" => "text/html"}, ["Nothing to see here."]]
    end
  end

  private

  def is_whitelisted?(request)
    sites_regexp = Regexp.union(ALLOWED_SITES)

    is_allowed = false

    ALLOWED_SITES.each do |site|
      is_allowed = request.referer =~ sites_regexp
    end

    return is_allowed
  end

  def return_file(file, request)
    if is_whitelisted?(request)
      [200,
        {
          "Content-Type" => "text/javascript",
          "Access-Control-Allow-Origin" => "*"
        },
        [File.read(File.join('dist', file))]
      ]
    else
      [400, {"Content-Type" => "text/javascript"}, ["console.log('This site not supported by the City of Boston. Contact digital@boston.gov for help.')"]]
    end
  end
end

@app = Header.new
run @app
