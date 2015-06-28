from django.db import models

from django.contrib.auth.models import User


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

	#basic info
	user = models.OneToOneField(User, primary_key=True)
	name = models.CharField(max_length=50)
	phone = models.CharField(max_length=20)
	email = models.CharField(max_length=50)

	#cancer related
	cancer_type = models.CharField(max_length=1,
									choices=CANCER_TYPES)
	cancer_stage = models.IntegerField(default=1)

	def __unicode__(self):
		return u'%s' % self.name