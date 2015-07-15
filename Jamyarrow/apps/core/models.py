from django.db import models

from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

#class for patient
class Patient(models.Model):
	LUNG = 'L'
	BREAST = 'B'
	COLORECTUM = 'C'
	PROSTATE = 'P'
	STOMACH = 'S'
	LIVER = 'I'
	KIDNEY = 'K'
	CANCER_TYPES = (
		(LUNG, 'Lung'),
		(BREAST, 'Breast'),
		(COLORECTUM, 'Colorectum'),
		(PROSTATE, 'Prostate'),
		(STOMACH, 'Stomach'),
		(LIVER, 'Liver'),
		(KIDNEY, 'Kidney'),
	)

	#basic info for user
	user = models.ForeignKey(User)
	name = models.CharField(max_length=50)
	phone = models.CharField(max_length=20)

	#cancer related
	cancer_type = models.CharField(max_length=1,
									choices=CANCER_TYPES)
	cancer_stage = models.IntegerField(default=1)

	def __unicode__(self):
		return u'%s' % self.name

#class for tracker
class TrackedItem(models.Model):
	SLEEP = 'SL'
	FOOD = 'FD'
	ACTIVITY = 'AT'
	MOOD = 'MD'
	SYMPTOM = 'SY'
	MEDICATION = 'ME'
	CATEGORY = (
		(SLEEP, 'Sleep'),
		(FOOD, 'Food'),
		(ACTIVITY, 'Activity'),
		(MOOD, 'Mood'),
		(SYMPTOM, 'Symptom'),
		(MEDICATION, 'Medication'),
	)
	patient = models.ForeignKey(Patient)
	name = models.CharField(max_length=50, unique=True)
	category = models.CharField(max_length=2, choices=CATEGORY)
	severity = models.BooleanField(default=False)
	duration = models.BooleanField(default=False)
	quality = models.BooleanField(default=False)
	quantity = models.BooleanField(default=False)
	yes_no = models.BooleanField(default=False)
	goal = models.FloatField(blank=True)

	def __unicode__(self):
		return u'%s' % self.name

#class for TrackedItem
class TrackEntry(models.Model):
	patient = models.ForeignKey(Patient)
	tracked_item = models.ForeignKey(TrackedItem)
	time_stamp = models.DateTimeField(default=timezone.now)
	severity = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(5)], blank=True, default=0) #1-5 scale
	duration = models.IntegerField(validators=[MinValueValidator(0)], blank=True)
	quality = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(5)], blank=True, default=0) #1-5 scale
	quantity = models.FloatField(blank=True)
	yes_no = models.BooleanField(default=False, blank=True)
	note = models.TextField(blank=True)

class Alert(models.Model):
	SUNDAY = 'SU'
	MONDAY = 'MO'
	TUESDAY = 'TU'
	WEDNESDAY = 'WE'
	THURSDAY = 'TR'
	FRIDAY = 'FR'
	SATURDAY = 'SA'
	DAYS = (
		(SUNDAY, 'Sunday'),
		(MONDAY, 'Monday'),
		(TUESDAY, 'Tuesday'),
		(WEDNESDAY, 'Wednesday'),
		(THURSDAY, 'Thursday'),
		(FRIDAY, 'Friday'),
		(SATURDAY, 'Saturday'),
	)
	track_entry = models.ForeignKey(TrackEntry)
	daytime = models.TimeField()
	dayweek = models.CharField(max_length=2,
								choices=DAYS)
